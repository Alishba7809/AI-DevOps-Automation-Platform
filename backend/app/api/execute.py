"""POST /execute — the primary entry point for natural-language commands."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.safety import SafetyError
from app.schemas import ExecuteRequest, ExecuteResponse
from app.services import execute_command

router = APIRouter()


@router.post("/execute", response_model=ExecuteResponse, summary="Execute NL command")
def execute(
    payload: ExecuteRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ExecuteResponse:
    """Accept a natural-language DevOps command and run it through the MCP pipeline.

    When authentication is enabled, ``get_current_user`` requires a valid JWT.
    In demo mode (auth disabled) it supplies the implicit system administrator,
    preserving the original zero-login workflow.
    """
    try:
        return execute_command(
            db,
            command=payload.command,
            dry_run=payload.dry_run,
            confirm_destructive=payload.confirm_destructive,
            user=user,
            ip_address=request.client.host if request.client else None,
        )
    except SafetyError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
