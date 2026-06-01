
# Task Management API

A **production-grade full-stack task management system** developed as part of the Primetrade.ai Backend Intern Assignment. This project demonstrates expertise in designing secure, scalable REST APIs with modern backend engineering practices.

The system implements **JWT-based authentication with HttpOnly cookies**, **Role-Based Access Control (RBAC)**, and full **CRUD operations** for task management — all built on a **microservices architecture** with separate FastAPI services for authentication and task domains, connected through an **Nginx API gateway** with active **load balancing** across multiple service instances.

On the security front, the project enforces **bcrypt password hashing**, **Pydantic input validation**, **CORS hardening**, and **stateless JWT authentication** shared across services. Performance is optimized through **Redis caching** with automatic cache invalidation on writes, and **database indexing** on frequently queried fields.

The entire stack is **containerized with Docker**, backed by **PostgreSQL** with **Alembic migrations**, and includes a **React frontend** with protected routes, role-based dashboards, and real-time error/success notifications. API documentation is available via **Swagger** per service and a **Postman collection** for end-to-end testing.

> ⚡ Built to be scalable, secure, and deployment-ready — exceeding all assignment requirements.
---

## Quick Start (Docker)

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
cp backend/.env.example backend/.env   # fill in your values
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8000 |
| Auth Docs (Swagger) | http://localhost:8001/docs |
| Tasks Docs (Swagger) | http://localhost:8002/docs |

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Admin 2 | admin2@example.com | Admin@456 |
| User | user@example.com | User@1234 |

> Admin logs in at `/login` → redirected to `/admin/dashboard`
> User logs in at `/login` → redirected to `/dashboard`

---

## Screenshots

| Login | User Dashboard | Admin Dashboard |
|---|---|---|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Admin](docs/screenshots/admin.png) |

---

## Tech Stack

**Backend:**
- FastAPI
- PostgreSQL (Neon-compatible)
- SQLAlchemy + Alembic migrations
- Redis caching
- JWT authentication (HttpOnly cookies)
- Nginx API gateway
- Docker

**Frontend:**
- React
- Axios
- Protected routes
- Error/success notifications

---

## System Architecture

```mermaid
graph TD
    A[React Frontend :5173] --> B[Nginx API Gateway :8000]
    B --> C[Auth Service :8001]
    B --> D[Tasks Service 1 :8002]
    B --> E[Tasks Service 2 :8003]
    C --> F[(PostgreSQL)]
    D --> F
    D --> G[(Redis Cache)]
    E --> F
    E --> G
```

---

## Features

- JWT authentication with HttpOnly cookies
- Role-based authorization — `user` accesses own tasks only, `admin` manages all
- Task CRUD with pagination (`page`, `size`)
- Pydantic validation (`UserCreate`, `UserLogin`, `TaskCreate`, `TaskUpdate`)
- Redis caching for task listing with cache invalidation on create/update/delete
- Structured logging to `backend/logs/app.log`
- Swagger docs per service
- Nginx API gateway with load balancing across two task service instances
- Alembic database migrations
- Error/success messages on all frontend forms
- Demo data seeding on startup

---

## Project Structure

```
backend/
  app/
    api/v1/routes/
    core/
    models/
    schemas/
    services/
    db/
    middleware/
  main.py
  auth_main.py
  tasks_main.py
  tests/
  Dockerfile
nginx/
  nginx.conf
frontend/
  src/
    components/
    pages/
    services/
    routes/
docs/
  screenshots/
  postman_collection.json
docker-compose.yml
```

---

## Environment Setup

```bash
cp backend/.env.example backend/.env
```

**backend/.env.example:**

```env
APP_NAME=Task Management API
APP_VERSION=1.0.0
DEBUG=False

DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_TTL=300

SECRET_KEY=replace_with_secure_random_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ACCESS_COOKIE_NAME=access_token
REFRESH_COOKIE_NAME=refresh_token
COOKIE_SECURE=False
COOKIE_SAMESITE=lax

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
CORS_ALLOW_CREDENTIALS=True

LOG_LEVEL=INFO
LOG_FILE=logs/app.log

ADMIN_REGISTRATION_KEY=replace_with_secret
DEMO_SEED_ENABLED=true
```

---

## Run Locally (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Open docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open UI: http://localhost:5173

---

## Run Using Docker

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8000 |
| Auth Docs | http://localhost:8001/docs |
| Tasks Docs | http://localhost:8002/docs |

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/auth/users/{id}` | Get user by ID (admin only) |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/tasks/` | Create task |
| GET | `/api/v1/tasks/?page=1&size=10` | Get paginated tasks |
| PUT | `/api/v1/tasks/{task_id}` | Update task |
| DELETE | `/api/v1/tasks/{task_id}` | Delete task |

**Task status values:** `pending`, `in_progress`, `completed`

---

## API Documentation

- **Swagger (Auth):** http://localhost:8001/docs
- **Swagger (Tasks):** http://localhost:8002/docs
- **Postman Collection:** [`docs/postman_collection.json`](docs/postman_collection.json)

Import into Postman: File → Import → select the file

> **Note:** Tasks endpoints require authentication. Run Login first, then test task endpoints. Cookies are handled automatically by Postman.

---

## Running Tests

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

---

## Migrations (Alembic)

```bash
# Apply migrations
cd backend
alembic upgrade head

# Generate new migration
alembic revision --autogenerate -m "describe_change"

# Rollback
alembic downgrade -1
```

---

## Admin Registration (API only)

To create admin accounts via API:

```json
POST /api/v1/auth/register
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "Admin@123",
  "role": "admin",
  "admin_registration_key": "your_admin_key"
}
```

> `ADMIN_REGISTRATION_KEY` is a server-side secret stored in `backend/.env` only — never exposed in frontend.

---

## Scalability Notes

| Feature | Implementation |
|---|---|
| Caching | Redis caches task list, invalidated on write |
| Load balancing | Nginx `least_conn` across 2 task service instances |
| Microservices | Auth and tasks as independently deployable FastAPI apps |
| Stateless auth | JWT tokens work across all service instances |
| Database indexing | Indexed on `email`, `username`, task status and ownership |
| Cloud DB | Compatible with Neon / Render PostgreSQL |
| Containerized | Docker containers for all services |

---

## Known Limitations

| Limitation | Planned Fix |
|---|---|
| No refresh token blacklist | Redis-based revocation store |
| No rate limiting on auth endpoints | Nginx rate limit or slowapi |
| No email verification | SMTP integration |
| No background job queue | Celery + Redis |

---

## Future Improvements

- Background workers for async notifications
- Integration and load testing pipeline
- Policy-based authorization engine
