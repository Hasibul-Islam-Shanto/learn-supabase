import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Comment } from "../../types";
import Avatar from "../ui/Avatar";
import { SendIcon, SmileIcon } from "../ui/icons";
import { formatDate } from "../../utils/date-format";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../context/auth-context";
import toast from "react-hot-toast";

const PREVIEW_COUNT = 3;

interface CommentSectionProps {
  postId: string;
  initialCount: number;
  onCountChange: (delta: number) => void;
}

export default function CommentSection({
  postId,
  initialCount,
  onCountChange,
}: CommentSectionProps) {
  const { session } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `id, content, created_at, author_id,
        author:profiles!comments_author_id_fkey(id, full_name, username, avatar_url)`,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!error && data) setComments((data as unknown as Comment[]) ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchComments]);

  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text || !session?.user.id) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: session.user.id,
      content: text,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setCommentText("");
      onCountChange(1);
      await fetchComments();
    }
    setSubmitting(false);
    inputRef.current?.focus();
  };

  const visibleComments = showAll ? comments : comments.slice(-PREVIEW_COUNT);
  const hiddenCount = comments.length - PREVIEW_COUNT;

  return (
    <div className="border-t border-line px-4 pb-4 pt-3">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <>
          {/* "View more" toggle */}
          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="mb-3 text-sm font-semibold text-brand-700 hover:underline"
            >
              View {hiddenCount} more comment{hiddenCount > 1 ? "s" : ""}
            </button>
          )}
          {showAll && comments.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(false)}
              className="mb-3 text-sm font-semibold text-brand-700 hover:underline"
            >
              Show less
            </button>
          )}

          {visibleComments.length === 0 && initialCount === 0 ? (
            <p className="mb-3 text-center text-sm text-muted">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="mb-3 space-y-3">
              {visibleComments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <Link
                    to={`/profile/${comment.author?.id}`}
                    className="shrink-0"
                  >
                    <Avatar
                      src={comment.author?.avatar_url ?? "/default-avatar.png"}
                      alt={comment.author?.full_name ?? ""}
                      size={32}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl bg-canvas px-3 py-2">
                      <Link
                        to={`/profile/${comment.author?.id}`}
                        className="text-sm font-semibold text-brand hover:underline"
                      >
                        {comment.author?.full_name ?? comment.author?.username}
                      </Link>
                      <p className="mt-0.5 text-sm leading-relaxed text-brand-900">
                        {comment.content}
                      </p>
                    </div>
                    <p className="mt-1 pl-3 text-xs text-muted">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Comment composer */}
      <div className="flex items-center gap-2">
        <Avatar
          src={
            session?.user?.user_metadata?.avatar_url ?? "/default-avatar.png"
          }
          alt=""
          size={32}
        />
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit();
            }}
            disabled={submitting}
            className="w-full rounded-full bg-canvas py-2 pl-4 pr-10 text-sm text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!commentText.trim() || submitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-accent transition-opacity disabled:text-muted"
            aria-label="Post comment"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
          <SmileIcon
            size={16}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>
    </div>
  );
}
