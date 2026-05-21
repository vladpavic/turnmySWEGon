import io

from fastapi.testclient import TestClient


def test_create_text_only_post(client: TestClient) -> None:
    response = client.post(
        "/posts",
        data={"username": "Geralt", "text": "Just finished Witcher 3. 10/10."},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "Geralt"
    assert body["text"] == "Just finished Witcher 3. 10/10."
    assert body["images"] == []


def test_create_post_with_image(client: TestClient) -> None:
    fake_image = io.BytesIO(b"fake png bytes")
    response = client.post(
        "/posts",
        data={"username": "Ciri", "text": "Screenshot from my run"},
        files=[("images", ("screenshot.png", fake_image, "image/png"))],
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["images"]) == 1
    assert body["images"][0]["order"] == 0


def test_create_post_with_multiple_images(client: TestClient) -> None:
    files = [
        ("images", (f"img{i}.png", io.BytesIO(b"bytes"), "image/png")) for i in range(3)
    ]
    response = client.post(
        "/posts",
        data={"username": "Yennefer"},
        files=files,
    )
    assert response.status_code == 200
    images = response.json()["images"]
    assert len(images) == 3
    assert [img["order"] for img in images] == [0, 1, 2]


def test_create_empty_post_is_rejected(client: TestClient) -> None:
    response = client.post("/posts", data={"username": "Triss"})
    assert response.status_code == 422


def test_get_latest_post_returns_most_recent(client: TestClient) -> None:
    client.post("/posts", data={"username": "player1", "text": "First post"})
    client.post("/posts", data={"username": "player2", "text": "Second post"})

    response = client.get("/posts/latest")
    assert response.status_code == 200
    assert response.json()["text"] == "Second post"


def test_get_latest_post_when_empty(client: TestClient) -> None:
    response = client.get("/posts/latest")
    assert response.status_code == 404
