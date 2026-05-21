# CampFire 🔥

A social media platform for sharing epic gaming moments. Share your thoughts and memorable screenshots with the community.

## Stack

- **Backend** — Python, FastAPI, SQLModel
- **Frontend** — React, Vite
- **Database** — PostgreSQL (SQLite for local dev)
- **Infrastructure** — Docker Compose, Traefik

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (LTS)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Git

## Backend (local dev)

```bash
cd backend
uv sync --all-groups  # installs Python and all dependencies
uv run uvicorn app.main:app --reload  # starts dev server at localhost:8000
```

### Tests & linting

```bash
uv run pytest
uv run ruff check .
uv run ruff format .
```

## API Documentation

With the backend running, the following are available at:

- `http://localhost:8000/docs` — interactive Swagger UI
- `http://localhost:8000/redoc` — alternative documentation UI
- `http://localhost:8000/openapi.json` — raw OpenAPI schema

## Frontend (local dev)

```bash
cd frontend
npm install
npm run dev  # starts dev server at localhost:5173
```

### Linting & formatting

```bash
npm run lint
npm run format
```

## Microservices

Image-Resizer provides RabbitMQ management UI at:

- `http://localhost:15672` — credentials: `guest/guest`