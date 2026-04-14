# Task Management Full-Stack Assignment

Production-style task management system with FastAPI, PostgreSQL, Redis, JWT auth, RBAC, React frontend, an Nginx API gateway, and split auth/tasks services.

## Tech Stack

Backend:
- FastAPI
- PostgreSQL (Neon-compatible)
- SQLAlchemy
- Alembic migrations
- Redis caching
- JWT authentication (HttpOnly cookies)
- Nginx API gateway
- Docker

Frontend:
- React
- Axios
- Protected routes

## Authentication Flow

1. User logs in with email/password
2. Server returns:
   - Access token (short-lived)
   - Refresh token (long-lived)
3. Tokens stored as HttpOnly cookies
4. Access token authorizes API requests
5. Refresh endpoint rotates tokens when expired

## Project Structure

```text
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
docker-compose.yml
```

## Features

- JWT authentication with HttpOnly cookies (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`)
- Role-based authorization (`admin` can delete any task)
- Task CRUD APIs under `/api/v1/tasks` with pagination (`page`, `size`)
- Pydantic validation (`UserCreate`, `UserLogin`, `TaskCreate`, `TaskUpdate`)
- Redis caching for `GET /api/v1/tasks/` (admin listing), cache invalidation on create/update/delete
- Structured logging into `backend/logs/app.log`
- Swagger docs per service (`http://localhost:8001/docs` for auth, `http://localhost:8002/docs` for tasks)
- Nginx API gateway and task-service load balancing
- Alembic migrations with initial schema revision

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust values:

- `DATABASE_URL` (Neon/PostgreSQL URL, e.g. `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
- `REDIS_HOST`
- `REDIS_PORT`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `ACCESS_COOKIE_NAME`
- `REFRESH_COOKIE_NAME`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`
- `ADMIN_REGISTRATION_KEY` (required only when registering an `admin` user)
- `DEMO_SEED_ENABLED` (`true`/`false`, default `true`; seeds demo users/tasks)
- `CORS_ORIGINS` (comma-separated, e.g. `http://localhost:5173,http://localhost:3000`)
- `CORS_ALLOW_CREDENTIALS`
- `LOG_FILE`

## Run Locally (Without Docker)

### Backend

1. Create and activate a Python virtual environment.
2. Install dependencies:
   - `pip install -r backend/requirements.txt`
3. Start API:
   - `cd backend`
   - `uvicorn main:app --reload`
4. Run migrations:
   - `alembic upgrade head`
5. Open docs:
   - `http://localhost:8000/docs`

### Frontend

1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. Start app:
   - `npm run dev`
3. Open UI:
   - `http://localhost:5173`

**Routes:** `/register` creates **user** accounts only. **Administrators cannot register** in the UI; they must sign in at `/login` (use “Are you an administrator?” for admin-focused copy). After login, **users** go to `/dashboard` and **admins** go to `/admin/dashboard`.

## Demo Accounts (seeded)

If `DEMO_SEED_ENABLED=true`, startup ensures these accounts/tasks exist:

- Admin user:
  - Username: `admin`
  - Email: `admin@example.com`
  - Password: `Admin@123`
- Admin user 2:
  - Username: `admin_two`
  - Email: `admin2@example.com`
  - Password: `Admin@456`
- Normal user (can register/login in the web UI):
  - Username: `normaluser`
  - Email: `user@example.com`
  - Password: `User@1234`

Admin login is routed to `/admin/dashboard` and can manage all tasks.

## Admin Registration (API)

To create additional admin accounts without the web UI, call `POST /api/v1/auth/register` with:

- `username`
- `email`
- `password`
- `role=admin`
- `admin_registration_key` (must match `ADMIN_REGISTRATION_KEY` in `backend/.env`)

Example local value in `backend/.env.example`:

- `ADMIN_REGISTRATION_KEY=AdminSecret123`

Why this is in backend `.env`:

- `ADMIN_REGISTRATION_KEY` is a server-side secret.
- Keeping it in backend environment config prevents exposing it in frontend bundles/source.
- Backend validates admin signup requests by matching `admin_registration_key` with this env value.

## Run Using Docker

From project root:

1. `docker compose up --build`
2. Gateway API base: `http://localhost:8000`
3. Frontend: `http://localhost:5173`
4. Gateway docs aggregator: `http://localhost:8000/docs`
5. Service docs:
   - Auth service docs: `http://localhost:8001/docs`
   - Tasks service docs: `http://localhost:8002/docs`

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Tasks

- `POST /api/v1/tasks/`
- `GET /api/v1/tasks/?page=1&size=10`
- `PUT /api/v1/tasks/{task_id}`
- `DELETE /api/v1/tasks/{task_id}`

## Migrations (Alembic)

- Initial revision: `backend/alembic/versions/0001_initial_schema.py`
- Generate new migration:
  - `cd backend`
  - `alembic revision --autogenerate -m "describe_change"`
- Apply migrations:
  - `alembic upgrade head`
- Rollback one migration:
  - `alembic downgrade -1`

### Neon Example

Use a Neon-style URL in `backend/.env`:

- `DATABASE_URL=postgresql://dummy_user:dummy_password@ep-your-project-region.neon.tech/neondb?sslmode=require`

## Architecture Notes

- **Layered design**: routes -> services -> models/db
- **Config isolation**: environment-driven config in `app/core/config.py`
- **Security**: bcrypt hashing, JWT auth, HttpOnly cookie sessions, role checks
- **RBAC authorization**: `user` can only access their own tasks; `admin` can read/edit/delete all users' tasks
- **CORS hardening**: startup validation rejects `CORS_ORIGINS=*` when credentials are enabled
- **Error management**: centralized exception logging middleware
- **Microservice split**: separate FastAPI apps for auth and task domains (`auth_main.py`, `tasks_main.py`)
- **API gateway**: Nginx routes auth/task traffic and hides internal service topology
- **Gateway docs aggregation**: Nginx exposes a single docs hub at `/docs` linking both service docs and OpenAPI JSON specs
- **Containerized deployment**: separate containers for auth API, task APIs, gateway, Postgres, Redis, frontend

## Scalability Considerations

- **Redis caching** reduces repeated DB reads for task list APIs.
- **Load balancing active**: Nginx load-balances `/api/v1/tasks/*` across `tasks_api_1` and `tasks_api_2` using `least_conn`.
- **Docker containers** provide portable and reproducible runtime units.
- **Microservices architecture**: auth and tasks run as independently deployable services sharing auth via JWT.
- **Database indexing**: indexed lookup fields (`email`, `username`, task status/ownership) help query performance at scale.

## Deployment Readiness

This project supports:

- Docker container deployment
- Cloud PostgreSQL (Neon / Render)
- Horizontal scaling via Nginx load balancing
- Stateless JWT authentication across services
- Redis caching for performance optimization

## System Architecture

React Frontend
        ↓
Nginx API Gateway
        ↓
Auth Service (FastAPI)
Tasks Service (FastAPI)
        ↓
PostgreSQL + Redis

## Future Improvements

- Add refresh-token revocation/blacklist storage
- Add background workers for async notifications/auditing
- Add integration and load testing pipeline
- Move RBAC permissions into policy-based authorization engine
