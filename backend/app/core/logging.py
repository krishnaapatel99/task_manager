import logging
import os
import sys
from logging.handlers import RotatingFileHandler

from app.core.config import get_settings

settings = get_settings()


def setup_logging() -> logging.Logger:
    """
    Configure structured logging with both file and console handlers.

    - File handler: writes JSON-structured logs to logs/app.log with rotation.
    - Console handler: human-readable output for development.

    Returns:
        Configured root logger instance.
    """
    # Ensure log directory exists
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger("task_management")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    # Prevent duplicate handlers on re-init
    if logger.handlers:
        return logger

    # Log format
    log_format = logging.Formatter(
        fmt=(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"module": "%(module)s", "function": "%(funcName)s", '
            '"line": %(lineno)d, "message": "%(message)s"}'
        ),
        datefmt="%Y-%m-%dT%H:%M:%S",
    )

    console_format = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler with rotation (10MB per file, keep 5 backups)
    file_handler = RotatingFileHandler(
        settings.LOG_FILE,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(log_format)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    console_handler.setFormatter(console_format)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# Module-level logger instance
logger = setup_logging()
