import { useRef, useState } from 'react';
import type { Comment } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import { SendIcon, SmileIcon } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/context/auth-context';
import { useComments } from '../hooks/useComments';
import CommentItem from './CommentItem';
import DeleteConfirm from './DeleteConfirm';

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
  const { comments, loading, currentUserId, submit, remove, applyUpdate } =
    useComments(postId);

  const [showAll, setShowAll] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const ok = await submit(commentText);
    if (ok) {
      setCommentText('');
      onCountChange(1);
    }
    setSubmitting(false);
    inputRef.current?.focus();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;
    const ok = await remove(deletingComment);
    if (ok) {
      onCountChange(-1);
      setDeletingComment(null);
    }
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
          {!showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mb-3 text-sm font-semibold text-brand-700 hover:underline"
            >
              View {hiddenCount} more comment{hiddenCount > 1 ? 's' : ''}
            </button>
          )}
          {showAll && comments.length > PREVIEW_COUNT && (
            <button
              type="button"
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
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onUpdate={applyUpdate}
                  onDeleteRequest={setDeletingComment}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-2">
        <Avatar
          src={
            session?.user?.user_metadata?.avatar_url ?? '/default-avatar.png'
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
              if (e.key === 'Enter' && !e.shiftKey) handleSubmit();
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

      <DeleteConfirm
        open={Boolean(deletingComment)}
        onClose={() => setDeletingComment(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
}
