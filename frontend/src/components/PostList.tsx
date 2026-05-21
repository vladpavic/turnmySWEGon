import type { Post } from "../types/post";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onUsernameClick: (username: string) => void;
}

export default function PostList({
  posts,
  loading,
  error,
  onUsernameClick,
}: PostListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/40">
        <p className="text-4xl mb-2">🔥</p>
        <p>No posts yet. Be the first to share a moment!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUsernameClick={onUsernameClick} />
      ))}
    </div>
  );
}
