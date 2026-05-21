FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt
COPY main.py .
CMD ["python", "main.py"]