import { useRef, useState } from "react";
import { createPost } from "../api/posts";
import type { Post } from "../types/post";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileCount = files?.length ?? 0;

  async function handleSubmit() {
    setError(null);
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (!text.trim() && fileCount === 0) {
      setError("A post needs at least some text or an image.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    if (text.trim()) formData.append("text", text.trim());
    if (files) {
      for (const file of files) formData.append("images", file);
    }

    try {
      setLoading(true);
      const post = await createPost(formData);
      onPostCreated(post);
      setText("");
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">Share a moment</h2>

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <textarea
          className="textarea textarea-bordered w-full resize-none"
          placeholder="What's happening in-game?"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <label className="btn btn-ghost btn-sm gap-2 cursor-pointer">
            📎{" "}
            {fileCount > 0
              ? `${fileCount} image${fileCount > 1 ? "s" : ""}`
              : "Attach images"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>

          <button
            className="btn btn-primary btn-sm ml-auto"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Post 🔥"
            )}
          </button>
        </div>

        {error && <p className="text-error text-sm">{error}</p>}
      </div>
    </div>
  );
}
