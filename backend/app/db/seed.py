from app.core.logging import logger
from app.core.security import hash_password
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole


def seed_demo_data(db) -> None:
    admin_email = "admin@example.com"
    second_admin_email = "admin2@example.com"
    user_email = "user@example.com"

    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        existing_admin = User(
            username="admin",
            email=admin_email,
            hashed_password=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )
        db.add(existing_admin)
        db.flush()

    existing_user = db.query(User).filter(User.email == user_email).first()
    if not existing_user:
        existing_user = User(
            username="normaluser",
            email=user_email,
            hashed_password=hash_password("User@1234"),
            role=UserRole.USER,
        )
        db.add(existing_user)
        db.flush()

    existing_second_admin = db.query(User).filter(User.email == second_admin_email).first()
    if not existing_second_admin:
        existing_second_admin = User(
            username="admin_two",
            email=second_admin_email,
            hashed_password=hash_password("Admin@456"),
            role=UserRole.ADMIN,
        )
        db.add(existing_second_admin)
        db.flush()

    has_any_task = db.query(Task.id).first()
    if not has_any_task:
        db.add_all(
            [
                Task(
                    title="Admin task: Review all teams",
                    description="Admin can edit/delete this and every other task",
                    status=TaskStatus.IN_PROGRESS,
                    owner_id=existing_admin.id,
                ),
                Task(
                    title="User task: Finish assignment",
                    description="Visible to user owner and admin",
                    status=TaskStatus.PENDING,
                    owner_id=existing_user.id,
                ),
                Task(
                    title="User task: Submit report",
                    description="Another regular user task",
                    status=TaskStatus.COMPLETED,
                    owner_id=existing_user.id,
                ),
            ]
        )

    db.commit()
    logger.info("Demo seed data checked/created")
