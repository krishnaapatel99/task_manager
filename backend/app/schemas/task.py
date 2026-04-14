from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.task import TaskStatus


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=200, examples=["Complete project report"])
    description: Optional[str] = Field(None, max_length=2000, examples=["Write the final report for Q4"])
    status: TaskStatus = Field(default=TaskStatus.PENDING)


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None


class TaskResponse(BaseModel):
    """Schema for task data in API responses."""
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedTaskResponse(BaseModel):
    items: list[TaskResponse]
    page: int
    size: int
    total: int
