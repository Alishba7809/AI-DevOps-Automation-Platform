"""Task history endpoints with per-user access control."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Result, Task, TaskStatus, User, UserRole
from app.schemas import ResultOut, TaskListResponse, TaskOut

router = APIRouter()


def _visible_tasks_query(db: Session, user: User):
    """Admins see all task history; other roles see only their own tasks."""
    query = db.query(Task)
    if user.role != UserRole.ADMIN:
        query = query.filter(Task.user_id == user.id)
    return query


def _get_visible_task(db: Session, user: User, task_id: int) -> Task:
    query = _visible_tasks_query(db, user).filter(Task.id == task_id)
    task = query.first()
    if not task:
        # Use 404 rather than leaking whether another user's task exists.
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/", response_model=TaskListResponse, summary="List task history")
def list_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    status: TaskStatus | None = Query(None, description="Filter by status"),
    intent: str | None = Query(None, description="Filter by intent name"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TaskListResponse:
    query = _visible_tasks_query(db, user)
    if status:
        query = query.filter(Task.status == status)
    if intent:
        query = query.filter(Task.detected_intent == intent)
    total = query.count()
    items = (
        query.order_by(desc(Task.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return TaskListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get("/{task_id}", response_model=TaskOut, summary="Get single task")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Task:
    return _get_visible_task(db, user, task_id)


@router.get(
    "/{task_id}/result",
    response_model=ResultOut,
    summary="Get raw result for a task",
)
def get_task_result(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Result:
    # Authorize against the parent task before exposing the raw result.
    _get_visible_task(db, user, task_id)
    result = db.query(Result).filter(Result.task_id == task_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result
