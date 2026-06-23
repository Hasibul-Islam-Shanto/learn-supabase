import { useCallback, useEffect, useRef, useState } from 'react';
import type { Comment } from '../../types';
import Avatar from '../ui/Avatar';
import { SendIcon, SmileIcon } from '../ui/icons';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/auth-context';
import toast from 'react-hot-toast';
import CommentItem from './CommentItem';
import DeleteConfirm from './DeleteConfirm';

const PREVIEW_COUNT = 3;

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  author: Comment['author'];
  like_count: { count: number }[];
}

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
  const currentUserId = session?.user.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `id, post_id, author_id, content, created_at, updated_at,
        author:profiles!comments_author_id_fkey(id, full_name, username, avatar_url),
        like_count:comment_likes(count)`,
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as CommentRow[];
    const commentIds = rows.map((row) => row.id);

    let likedIds = new Set<string>();
    if (currentUserId && commentIds.length > 0) {
      const { data: likesData, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);
      if (likesError) console.error(likesError);
      likedIds = new Set((likesData ?? []).map((l) => l.comment_id));
    }

    setComments(
      rows.map((row) => ({
        id: row.id,
        post_id: row.post_id,
        author_id: row.author_id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        like_count: row.like_count[0]?.count ?? 0,
        liked_by_me: likedIds.has(row.id),
        author: row.author,
      })),
    );
    setLoading(false);
  }, [postId, currentUserId]);

  useEffect(() => {
    fetchComments(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchComments]);

  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text || !currentUserId) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: currentUserId,
      content: text,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setCommentText('');
      onCountChange(1);
      await fetchComments();
    }
    setSubmitting(false);
    inputRef.current?.focus();
  };

  const handleCommentUpdate = (updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComment || !currentUserId) return;
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', deletingComment.id)
      .eq('author_id', currentUserId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== deletingComment.id));
    onCountChange(-1);
    setDeletingComment(null);
    toast.success('Comment deleted');
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
                  onUpdate={handleCommentUpdate}
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
