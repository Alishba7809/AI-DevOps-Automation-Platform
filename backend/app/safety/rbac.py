"""Role-based authorization rules for natural-language command execution."""

from __future__ import annotations

from app.models import User, UserRole


# Viewer accounts are intentionally read-only. Developers and admins may use
# every currently registered intent; destructive actions still require the
# separate confirmation guardrail.
VIEWER_ALLOWED_INTENTS: frozenset[str] = frozenset(
    {
        "docker.list",
        "docker.status",
        "docker.logs",
        "system.health",
        "system.disk",
        "system.memory",
        "logs.analyze",
        "logs.errors",
        "logs.summary",
        "logs.tail",
        "file.info",
        "file.count",
        "file.read",
        "k8s.list_pods",
        # Unknown commands are allowed through RBAC so the router can return
        # its normal helpful "could not determine intent" response.
        "unknown",
    }
)


def can_execute_intent(user: User, intent: str) -> tuple[bool, str]:
    """Return whether ``user`` may execute ``intent`` and an optional reason."""
    if user.role in {UserRole.ADMIN, UserRole.DEVELOPER}:
        return True, ""
    if user.role == UserRole.VIEWER and intent in VIEWER_ALLOWED_INTENTS:
        return True, ""
    return (
        False,
        f"Role '{user.role.value}' is not allowed to execute '{intent}'. "
        "Viewer accounts are read-only.",
    )
