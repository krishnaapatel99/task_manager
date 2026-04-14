from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.logging import logger


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        f"API failure method={request.method} path={request.url.path} error={str(exc)}"
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
