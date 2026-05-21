import json
import os
import time
from pathlib import Path

import pika
import requests
from PIL import Image

RABBITMQ_URL = os.environ["RABBITMQ_URL"]
BACKEND_URL = os.environ["BACKEND_URL"]
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/app/uploads"))
MAX_SIZE = (800, 800)


def resize_image(filename: str) -> str:
    original = UPLOAD_DIR / filename
    stem = Path(filename).stem
    suffix = Path(filename).suffix
    thumb_filename = f"{stem}_thumb{suffix}"

    with Image.open(original) as img:
        img.thumbnail(MAX_SIZE, Image.LANCZOS)
        img.save(UPLOAD_DIR / thumb_filename, quality=85, optimize=True)

    return thumb_filename


def callback(ch, method, properties, body) -> None:
    try:
        data = json.loads(body)
        image_id: int = data["image_id"]
        filename: str = data["filename"]

        print(f"Resizing image {image_id}: {filename}")
        thumb_filename = resize_image(filename)

        requests.patch(
            f"{BACKEND_URL}/images/{image_id}/thumbnail",
            params={"thumbnail_filename": thumb_filename},
            timeout=10,
        ).raise_for_status()

        print(f"Thumbnail saved: {thumb_filename}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Failed to process image: {e}")
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
    channel.queue_declare(queue="image.resize", durable=True)
    channel.basic_qos(prefetch_count=1)  # process one image at a time
    channel.basic_consume(queue="image.resize", on_message_callback=callback)
    print("Image resizer ready, waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    main()