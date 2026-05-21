FROM python:3.12-slim
WORKDIR /app

# Install dependencies — torch CPU-only to keep image size reasonable
RUN pip install --no-cache-dir pika requests transformers
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Pre-download model at build time so startup is instant
RUN python -c "from transformers import pipeline; pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english')"

COPY main.py .
CMD ["python", "main.py"]