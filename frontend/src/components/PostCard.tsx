import { useState } from "react";
import type { Post } from "../types/post";

interface PostCardProps {
  post: Post;
  onUsernameClick: (username: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const HYPE_BADGE: Record<string, { emoji: string; label: string; cls: string }> = {
  hype: { emoji: "🔥", label: "Hype", cls: "badge-warning" },
  neutral: { emoji: "🙂", label: "Neutral", cls: "badge-info" },
  dead: { emoji: "💀", label: "Dead", cls: "badge-ghost" },
};

export default function PostCard({ post, onUsernameClick }: PostCardProps) {
  const [lightboxFilename, setLightboxFilename] = useState<string | null>(null);
  const sortedImages = [...post.images].sort((a, b) => a.order - b.order);
  const hype = post.hype ? HYPE_BADGE[post.hype] : null;

  return (
    <>
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body gap-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-lg font-bold">
                  {post.username[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <button
                  className="font-semibold hover:text-primary transition-colors"
                  onClick={() => onUsernameClick(post.username)}
                >
                  {post.username}
                </button>
                {hype && (
                  <span className={`badge badge-sm ${hype.cls}`}>
                    {hype.emoji} {hype.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/50">{timeAgo(post.created_at)}</p>
            </div>
          </div>

          {/* Text */}
          {post.text && <p className="text-sm leading-relaxed">{post.text}</p>}

          {/* Images */}
          {sortedImages.length > 0 && (
            <div
              className={`grid gap-1 rounded-lg overflow-hidden ${
                sortedImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {sortedImages.map((img, i) => (
                <img
                  key={img.id}
                  src={`/uploads/${img.thumbnail_filename ?? img.filename}`}
                  alt={`Screenshot ${i + 1}`}
                  title={img.thumbnail_filename ? "Click to view full size" : undefined}
                  className={`w-full object-cover max-h-80 ${
                    img.thumbnail_filename
                      ? "cursor-pointer hover:opacity-90 transition-opacity"
                      : ""
                  } ${sortedImages.length === 3 && i === 0 ? "row-span-2" : ""}`}
                  onClick={() =>
                    img.thumbnail_filename && setLightboxFilename(img.filename)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxFilename && (
        <dialog className="modal modal-open" onClick={() => setLightboxFilename(null)}>
          <div
            className="modal-box max-w-5xl p-1 bg-base-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/uploads/${lightboxFilename}`}
              alt="Full size"
              className="w-full rounded"
            />
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setLightboxFilename(null)}
            >
              ✕
            </button>
          </div>
          <div className="modal-backdrop" onClick={() => setLightboxFilename(null)} />
        </dialog>
      )}
    </>
  );
}
