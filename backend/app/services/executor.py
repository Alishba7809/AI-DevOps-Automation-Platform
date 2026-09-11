"""End-to-end executor: command → intent → MCP → tool → DB persistence.

This is the single entry point the API layer calls. Keeping the pipeline in
one place makes it straightforward to unit-test, audit, and instrument.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.safety.rbac import can_execute_intent
from app.intent.engine import intent_engine
from app.mcp.registry import tool_registry
from app.mcp.router import MCPRouterError, mcp_router
from app.models import Result, Task, TaskStatus, User
from app.safety import SafetyError, audit_log, guardrails, rate_limiter
from app.schemas import ExecuteResponse

logger = logging.getLogger(__name__)


def _finish_blocked_task(
    db: Session,
    *,
    task: Task,
    started: float,
    reason: str,
    event: str,
    user: User,
    ip_address: str | None,
    details: dict[str, Any],
    intent=None,
    warnings: list[str] | None = None,
) -> ExecuteResponse:
    """Persist a blocked task and its audit event, then build the API response."""
    task.status = TaskStatus.BLOCKED
    task.error_message = reason
    task.completed_at = datetime.utcnow()
    task.duration_ms = int((time.time() - started) * 1000)
    db.commit()

    audit_log(
        db,
        event=event,
        severity="warn",
        task_id=task.id,
        user_id=user.id,
        details=details,
        ip_address=ip_address,
    )

    return ExecuteResponse(
        task_id=task.id,
        status=TaskStatus.BLOCKED,
        intent=intent,
        error=reason,
        warnings=warnings or [],
        duration_ms=task.duration_ms,
    )


def execute_command(
    db: Session,
    *,
    command: str,
    dry_run: bool = False,
    confirm_destructive: bool = False,
    user: User,
    ip_address: str | None = None,
) -> ExecuteResponse:
    """Full pipeline: intent → RBAC/safety → MCP routing → execution → persist."""

    # ------------------------------------------------------------------
    # 0. Rate limiting
    # ------------------------------------------------------------------
    rl_key = f"user:{user.id}"
    allowed, _remaining = rate_limiter.allow(rl_key)
    if not allowed:
        raise SafetyError(
            f"Rate limit exceeded ({rate_limiter.limit}/min). Slow down for a moment."
        )

    # ------------------------------------------------------------------
    # 1. Create task row
    # ------------------------------------------------------------------
    task = Task(
        command=command,
        dry_run=dry_run,
        status=TaskStatus.PENDING,
        user_id=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    started = time.time()
    warnings: list[str] = []
    intent = None
    tool_call = None

    try:
        # --------------------------------------------------------------
        # 2. Intent detection
        # --------------------------------------------------------------
        intent = intent_engine.detect(command)
        task.detected_intent = intent.intent
        task.intent_confidence = intent.confidence
        task.entities = intent.entities

        # --------------------------------------------------------------
        # 3. Role-based authorization
        # --------------------------------------------------------------
        role_allowed, role_reason = can_execute_intent(user, intent.intent)
        if not role_allowed:
            return _finish_blocked_task(
                db,
                task=task,
                started=started,
                reason=role_reason,
                event="authorization.blocked",
                user=user,
                ip_address=ip_address,
                details={
                    "command": command,
                    "intent": intent.intent,
                    "role": user.role.value,
                    "reason": role_reason,
                },
                intent=intent,
                warnings=warnings,
            )

        # --------------------------------------------------------------
        # 4. Safety guardrails
        # --------------------------------------------------------------
        check = guardrails.check(
            command,
            intent,
            confirm_destructive=confirm_destructive,
        )
        if check.warnings:
            warnings.extend(check.warnings)

        if not check.allowed:
            return _finish_blocked_task(
                db,
                task=task,
                started=started,
                reason=check.reason,
                event="command.blocked",
                user=user,
                ip_address=ip_address,
                details={
                    "command": command,
                    "reason": check.reason,
                    "require_confirmation": check.require_confirmation,
                },
                intent=intent,
                warnings=warnings,
            )

        # --------------------------------------------------------------
        # 5. MCP routing
        # --------------------------------------------------------------
        tool_call = mcp_router.route(intent)
        task.selected_tool = tool_call.tool_name
        task.tool_params = tool_call.params

        tool = tool_registry.get(tool_call.tool_name)
        if tool is None:
            raise MCPRouterError(f"Tool '{tool_call.tool_name}' is not loaded")

        # --------------------------------------------------------------
        # 6. Execute
        # --------------------------------------------------------------
        task.status = TaskStatus.RUNNING
        db.commit()
        exec_result = tool.execute(tool_call.params, dry_run=dry_run)

        # --------------------------------------------------------------
        # 7. Persist result
        # --------------------------------------------------------------
        result_row = Result(
            task_id=task.id,
            success=exec_result.success,
            summary=exec_result.summary,
            data=exec_result.data,
            stdout=exec_result.stdout,
            stderr=exec_result.stderr,
        )
        db.add(result_row)

        warnings.extend(exec_result.warnings or [])
        duration_ms = int((time.time() - started) * 1000)
        task.duration_ms = duration_ms
        task.completed_at = datetime.utcnow()
        task.status = (
            TaskStatus.DRY_RUN
            if dry_run
            else (TaskStatus.SUCCESS if exec_result.success else TaskStatus.FAILED)
        )
        if not exec_result.success:
            task.error_message = exec_result.stderr or exec_result.summary
        db.commit()

        audit_log(
            db,
            event="command.executed",
            severity="info" if exec_result.success else "error",
            task_id=task.id,
            user_id=user.id,
            details={
                "command": command,
                "tool": tool_call.tool_name,
                "dry_run": dry_run,
                "success": exec_result.success,
                "role": user.role.value,
            },
            ip_address=ip_address,
        )

        return ExecuteResponse(
            task_id=task.id,
            status=task.status,
            intent=intent,
            tool_call=tool_call,
            result=exec_result.to_dict(),
            summary=exec_result.summary,
            duration_ms=duration_ms,
            warnings=warnings,
        )

    except MCPRouterError as exc:
        task.status = TaskStatus.FAILED
        task.error_message = str(exc)
        task.duration_ms = int((time.time() - started) * 1000)
        task.completed_at = datetime.utcnow()
        db.commit()
        return ExecuteResponse(
            task_id=task.id,
            status=TaskStatus.FAILED,
            intent=intent,
            error=str(exc),
            warnings=warnings,
            duration_ms=task.duration_ms,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Executor crashed")
        task.status = TaskStatus.FAILED
        task.error_message = str(exc)
        task.duration_ms = int((time.time() - started) * 1000)
        task.completed_at = datetime.utcnow()
        db.commit()
        audit_log(
            db,
            event="command.crashed",
            severity="error",
            task_id=task.id,
            user_id=user.id,
            details={"command": command, "error": str(exc)},
            ip_address=ip_address,
        )
        return ExecuteResponse(
            task_id=task.id,
            status=TaskStatus.FAILED,
            intent=intent,
            tool_call=tool_call,
            error=str(exc),
            warnings=warnings,
            duration_ms=task.duration_ms,
        )
