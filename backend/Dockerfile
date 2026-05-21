# Copy the uv binary from the official image — no separate uv install needed
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies first — this layer is cached as long as
# pyproject.toml and uv.lock don't change, even if app code does
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy application code and install the project itself
COPY app ./app
RUN uv sync --frozen --no-dev

# Create uploads directory
RUN mkdir -p uploads

# 0.0.0.0 makes uvicorn listen on all interfaces inside the container,
# not just localhost — without this the port is unreachable from outside
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]