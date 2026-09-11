"""Tests for command-level role-based access control."""

from app.models import User, UserRole
from app.safety.rbac import can_execute_intent


def make_user(role: UserRole) -> User:
    return User(
        username=f"user-{role.value}",
        email=f"{role.value}@example.com",
        hashed_password="not-used",
        role=role,
        is_active=True,
    )


def test_admin_can_deploy():
    allowed, reason = can_execute_intent(make_user(UserRole.ADMIN), "docker.deploy")
    assert allowed is True
    assert reason == ""


def test_developer_can_deploy():
    allowed, reason = can_execute_intent(make_user(UserRole.DEVELOPER), "docker.deploy")
    assert allowed is True
    assert reason == ""


def test_viewer_can_list_containers():
    allowed, reason = can_execute_intent(make_user(UserRole.VIEWER), "docker.list")
    assert allowed is True
    assert reason == ""


def test_viewer_can_read_system_health():
    allowed, reason = can_execute_intent(make_user(UserRole.VIEWER), "system.health")
    assert allowed is True
    assert reason == ""


def test_viewer_cannot_deploy():
    allowed, reason = can_execute_intent(make_user(UserRole.VIEWER), "docker.deploy")
    assert allowed is False
    assert "read-only" in reason


def test_viewer_cannot_scale_kubernetes():
    allowed, reason = can_execute_intent(make_user(UserRole.VIEWER), "k8s.scale")
    assert allowed is False
    assert "read-only" in reason
