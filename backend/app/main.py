import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select


from app.config import settings
from app.database import create_db_and_tables, get_session
from app.models import Post, PostImage, PostRead


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    create_db_and_tables()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield
    # anything after yield runs on shutdown


app = FastAPI(title="CampFire API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory=settings.upload_dir),
    name="uploads",
)


###############################################################################
# POST /posts  — create a new post
###############################################################################


@app.post("/posts", response_model=PostRead)
async def create_post(
    username: str = Form(...),
    text: str | None = Form(None),
    images: list[UploadFile] = File(default=[]),
    session: Session = Depends(get_session),
) -> Post:
    if not text and not images:
        raise HTTPException(
            status_code=422,
            detail="Post must have at least some text or one image.",
        )

    post = Post(username=username, text=text)
    session.add(post)
    session.flush()  # populates post.id before we need it for PostImage.post_id

    for order, upload in enumerate(images):
        suffix = Path(upload.filename or "image").suffix or ".jpg"
        filename = f"{uuid.uuid4().hex}{suffix}"
        dest = Path(settings.upload_dir) / filename

        with dest.open("wb") as f:
            shutil.copyfileobj(upload.file, f)

        session.add(PostImage(post_id=post.id, filename=filename, order=order))

    session.commit()
    session.refresh(post)
    return post


###############################################################################
# GET /posts  — list all posts, optionally filtered by username
###############################################################################


@app.get("/posts", response_model=list[PostRead])
def get_posts(
    username: str | None = None,
    session: Session = Depends(get_session),
) -> list[Post]:
    query = select(Post).order_by(Post.created_at.desc())
    if username:
        query = query.where(Post.username == username)
    return list(session.exec(query).all())


###############################################################################
# GET /posts/latest  — retrieve the single most recent post
###############################################################################


@app.get("/posts/latest", response_model=PostRead)
def get_latest_post(session: Session = Depends(get_session)) -> Post:
    post = session.exec(select(Post).order_by(Post.created_at.desc())).first()

    if post is None:
        raise HTTPException(status_code=404, detail="No posts found.")

    return post
