import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, StaticPool, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    """In-memory SQLite database, rebuilt fresh for every test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session, tmp_path, monkeypatch):
    """TestClient wired to the in-memory DB and a temp upload directory."""

    # Override the DB dependency
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    # Point uploads at a throwaway temp directory
    monkeypatch.setattr("app.main.settings.upload_dir", str(tmp_path))

    yield TestClient(app)

    app.dependency_overrides.clear()
