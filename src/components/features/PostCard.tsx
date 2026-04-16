import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Award, Megaphone, Send } from "lucide-react";
import type { Post, Comment } from "../../data/mock";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isAnnouncement = post.type === "announcement";
  const isAchievement = post.type === "achievement";

  const roleBadge =
    post.authorRole === "admin"
      ? "RESERVA CF"
      : post.authorRole === "coach"
        ? "Coach"
        : null;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div
      className={`card overflow-hidden ${isAnnouncement ? "border-l-4 border-l-primary" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm shrink-0"
          style={{ backgroundColor: post.authorColor + "22", color: post.authorColor }}
        >
          {post.authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm truncate">{post.authorName}</span>
            {roleBadge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                {roleBadge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted">{timeAgo(post.createdAt)}</span>
        </div>
        <button className="text-muted hover:text-text">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-2">
        {isAchievement && (
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-4 h-4 text-warning" />
            <span className="text-[11px] font-bold text-warning uppercase tracking-wider">Conquista</span>
          </div>
        )}
        {isAnnouncement && (
          <div className="flex items-center gap-1.5 mb-2">
            <Megaphone className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Anúncio</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-primary text-xs font-semibold">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-1">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-muted border-t border-border mt-2">
        <span>{post.likes} curtida{post.likes !== 1 ? "s" : ""}</span>
        <span>{post.comments.length} comentário{post.comments.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center gap-1 border-t border-border">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
            post.likedByUser ? "text-danger" : "text-muted hover:text-text"
          }`}
        >
          <Heart className="w-4 h-4" fill={post.likedByUser ? "currentColor" : "none"} />
          Curtir
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-muted hover:text-text transition"
        >
          <MessageCircle className="w-4 h-4" />
          Comentar
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-muted hover:text-text transition">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-surface-2/50">
          {post.comments.map((c: Comment) => (
            <div key={c.id} className="flex gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-[10px] shrink-0"
                style={{ backgroundColor: c.authorColor + "22", color: c.authorColor }}
              >
                {c.authorInitial}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs">{c.authorName}</span>
                <p className="text-xs text-muted mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 items-center">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              placeholder="Escreva um comentário..."
              className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none text-xs"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black disabled:opacity-30 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
