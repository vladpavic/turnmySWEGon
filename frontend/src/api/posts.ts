import type { Post } from "../types/post";

const BASE = "/api";

export async function fetchPosts(username?: string): Promise<Post[]> {
  const url = username
    ? `${BASE}/posts?username=${encodeURIComponent(username)}`
    : `${BASE}/posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function createPost(formData: FormData): Promise<Post> {
  const res = await fetch(`${BASE}/posts`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to create post");
  }
  return res.json();
}
