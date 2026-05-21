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
  hype:    { emoji: "🔥", label: "Hype",    cls: "badge-warning" },
  neutral: { emoji: "🙂", label: "Neutral", cls: "badge-info"    },
  dead:    { emoji: "💀", label: "Dead",    cls: "badge-ghost"   },
};

export default function PostCard({ post, onUsernameClick }: PostCardProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sortedImages = [...post.images].sort((a, b) => a.order - b.order);
  const hype = post.hype ? HYPE_BADGE[post.hype] : null;
  const hasMany = sortedImages.length > 1;

  function prevImage(index: number) {
    return (index - 1 + sortedImages.length) % sortedImages.length;
  }
  function nextImage(index: number) {
    return (index + 1) % sortedImages.length;
  }

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

          {/* Image carousel */}
          {sortedImages.length > 0 && (() => {
            const img = sortedImages[carouselIndex];
            return (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={`/uploads/${img.thumbnail_filename ?? img.filename}`}
                  alt={`Screenshot ${carouselIndex + 1}`}
                  className={`w-full object-cover max-h-80 ${
                    img.thumbnail_filename
                      ? "cursor-pointer hover:opacity-90 transition-opacity"
                      : ""
                  }`}
                  onClick={() => img.thumbnail_filename && setLightboxIndex(carouselIndex)}
                />

                {hasMany && (
                  <>
                    {/* Arrows */}
                    <button
                      className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/70 border-none"
                      onClick={() => setCarouselIndex(prevImage(carouselIndex))}
                    >
                      ‹
                    </button>
                    <button
                      className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/70 border-none"
                      onClick={() => setCarouselIndex(nextImage(carouselIndex))}
                    >
                      ›
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {sortedImages.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === carouselIndex ? "bg-white" : "bg-white/40"
                          }`}
                          onClick={() => setCarouselIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (() => {
        const img = sortedImages[lightboxIndex];
        return (
          <dialog className="modal modal-open" onClick={() => setLightboxIndex(null)}>
            <div
              className="modal-box max-w-5xl p-1 bg-base-300 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`/uploads/${img.filename}`}
                alt="Full size"
                className="w-full rounded"
              />

              {hasMany && (
                <>
                  <button
                    className="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2 bg-base-100/70 border-none"
                    onClick={() => setLightboxIndex(prevImage(lightboxIndex))}
                  >
                    ‹
                  </button>
                  <button
                    className="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2 bg-base-100/70 border-none"
                    onClick={() => setLightboxIndex(nextImage(lightboxIndex))}
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {sortedImages.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === lightboxIndex ? "bg-white" : "bg-white/40"
                        }`}
                        onClick={() => setLightboxIndex(i)}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={() => setLightboxIndex(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-backdrop" onClick={() => setLightboxIndex(null)} />
          </dialog>
        );
      })()}
    </>
  );
}
