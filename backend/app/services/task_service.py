from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.task import Task
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.cache_service import CacheService


class TaskService:
    TASKS_CACHE_KEY = "tasks:all"

    def __init__(self, db: Session) -> None:
        self.db = db
        self.cache = CacheService()

    def create_task(self, task_data: TaskCreate, owner_id: int) -> Task:
        task = Task(**task_data.model_dump(), owner_id=owner_id)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        self.cache.delete(self.TASKS_CACHE_KEY)
        logger.info(f"Task created id={task.id} owner_id={owner_id}")
        return task

    def get_tasks(self, current_user: User, page: int, size: int) -> tuple[list[Task], int]:
        offset = (page - 1) * size
        if current_user.role == UserRole.ADMIN:
            cache_key = f"{self.TASKS_CACHE_KEY}:page={page}:size={size}"
            cached = self.cache.get(cache_key)
            if cached:
                return [Task(**item) for item in cached["items"]], int(cached["total"])

            query = self.db.query(Task).order_by(Task.created_at.desc())
            total = query.count()
            tasks = query.offset(offset).limit(size).all()
            serialized = [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "status": t.status.value,
                    "owner_id": t.owner_id,
                    "created_at": t.created_at.isoformat(),
                }
                for t in tasks
            ]
            self.cache.set(cache_key, {"items": serialized, "total": total})
            return tasks, total

        query = (
            self.db.query(Task)
            .filter(Task.owner_id == current_user.id)
            .order_by(Task.created_at.desc())
        )
        total = query.count()
        tasks = query.offset(offset).limit(size).all()
        return tasks, total

    def get_task_by_id(self, task_id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def can_access_task(current_user: User, task: Task) -> bool:
        if current_user.role == UserRole.ADMIN:
            return True
        return task.owner_id == current_user.id

    def update_task(self, task: Task, task_data: TaskUpdate) -> Task:
        for field, value in task_data.model_dump(exclude_unset=True).items():
            setattr(task, field, value)

        self.db.commit()
        self.db.refresh(task)
        self.cache.delete(self.TASKS_CACHE_KEY)
        return task

    def delete_task(self, task: Task) -> None:
        task_id = task.id
        self.db.delete(task)
        self.db.commit()
        self.cache.delete(self.TASKS_CACHE_KEY)
        logger.info(f"Task deleted id={task_id}")
