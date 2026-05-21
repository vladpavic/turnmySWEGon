from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    pass


###############################################################################
# Table models (ORM)
###############################################################################


class PostImage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    filename: str  # just the filename; full path derived from config.upload_dir
    thumbnail_filename: str | None = None  # set by image-resizer microservice
    order: int = Field(default=0)  # position within the post's image list

    post: "Post | None" = Relationship(back_populates="images")


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    text: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        index=True,
    )

    images: list[PostImage] = Relationship(back_populates="post")


###############################################################################
# Response schemas (what the API returns — decoupled from ORM internals)
###############################################################################


class PostImageRead(SQLModel):
    id: int
    filename: str
    thumbnail_filename: str | None
    order: int


class PostRead(SQLModel):
    id: int
    username: str
    text: str | None
    created_at: datetime
    images: list[PostImageRead] = []
