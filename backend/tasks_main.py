from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.tasks import router as tasks_router
from app.core.config import get_settings
from app.core.logging import logger
from app.db.base import Base
from app.db.seed import seed_demo_data
from app.db.session import SessionLocal, engine
from app.middleware.exception_middleware import unhandled_exception_handler

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    if settings.DEMO_SEED_ENABLED:
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()
    logger.info("Tasks service startup complete")
    yield
    logger.info("Tasks service shutdown complete")


app = FastAPI(
    title=f"{settings.APP_NAME} - Tasks Service",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "tasks"}
