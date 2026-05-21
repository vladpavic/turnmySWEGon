import json
import os
import time

import pika
import requests
from transformers import pipeline

RABBITMQ_URL = os.environ["RABBITMQ_URL"]
BACKEND_URL = os.environ["BACKEND_URL"]

# Loaded once at startup — model was pre-downloaded during image build
print("Loading sentiment model...")
_classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
)
print("Model ready.")


def analyze(text: str) -> str:
    result = _classifier(text, truncation=True, max_length=512)[0]
    label: str = result["label"]
    score: float = result["score"]

    if label == "POSITIVE" and score >= 0.65:
        return "hype"
    if label == "NEGATIVE" and score >= 0.65:
        return "dead"
    return "neutral"


def callback(ch, method, properties, body) -> None:
    try:
        data = json.loads(body)
        post_id: int = data["post_id"]
        text: str = data["text"]

        hype = analyze(text)
        print(f"Post {post_id}: {hype}")

        requests.patch(
            f"{BACKEND_URL}/posts/{post_id}/hype",
            params={"label": hype},
            timeout=10,
        ).raise_for_status()

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Failed to analyze post: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def connect_with_retry() -> pika.BlockingConnection:
    while True:
        try:
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            print("Connected to RabbitMQ")
            return connection
        except Exception:
            print("RabbitMQ not ready, retrying in 5s...")
            time.sleep(5)


def main() -> None:
    connection = connect_with_retry()
    channel = connection.channel()
    channel.queue_declare(queue="post.hype", durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue="post.hype", on_message_callback=callback)
    print("Hype analyzer ready, waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    main()