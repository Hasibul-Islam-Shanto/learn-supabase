import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Comment } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import { HeartIcon } from '@/shared/ui/icons';
import { formatDate } from '@/shared/lib/date-format';
import { updateComment } from '../api/comments';
import { useToggleLike } from '../hooks/useToggleLike';
import CommentMenu from './CommentMenu';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onUpdate: (comment: Comment) => void;
  onDeleteRequest: (comment: Comment) => void;
}

function isEdited(comment: Comment): boolean {
  if (!comment.updated_at) return false;
  return (
    new Date(comment.updated_at).getTime() >
    new Date(comment.created_at).getTime()
  );
}

export default function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDeleteRequest,
}: CommentItemProps) {
  const { liked, likeCount, toggle } = useToggleLike({
    table: 'comment_likes',
    column: 'comment_id',
    targetId: comment.id,
    userId: currentUserId,
    initialLiked: comment.liked_by_me,
    initialCount: comment.like_count,
    onChange: (nextLiked, nextCount) =>
      onUpdate({ ...comment, liked_by_me: nextLiked, like_count: nextCount }),
  });
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const isAuthor = currentUserId === comment.author_id;
  const name = comment.author?.full_name ?? comment.author?.username ?? 'User';

  const handleSaveEdit = async () => {
    const text = editText.trim();
    if (!text || !currentUserId || !isAuthor) return;
    setSaving(true);
    const updatedAt = new Date().toISOString();
    const { error } = await updateComment(
      comment.id,
      currentUserId,
      text,
      updatedAt,
    );

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    onUpdate({ ...comment, content: text, updated_at: updatedAt });
    setEditing(false);
    setSaving(false);
    toast.success('Comment updated');
  };

  const handleCancelEdit = () => {
    setEditText(comment.content);
    setEditing(false);
  };

  return (
    <div className="flex gap-2.5">
      <Link to={`/profile/${comment.author?.id}`} className="shrink-0">
        <Avatar
          src={comment.author?.avatar_url ?? '/default-avatar.png'}
          alt={name}
          size={32}
        />
      </Link>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="rounded-2xl bg-canvas px-3 py-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              disabled={saving}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-brand-900 focus:outline-none disabled:opacity-60"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editText.trim() || saving}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-canvas px-3 py-2">
            <Link
              to={`/profile/${comment.author?.id}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              {name}
            </Link>
            <p className="mt-0.5 text-sm leading-relaxed text-brand-900">
              {comment.content}
            </p>
          </div>
        )}

        <div className="mt-1 flex items-center gap-3 pl-3">
          {currentUserId && (
            <button
              type="button"
              onClick={toggle}
              className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-accent ${
                liked ? 'text-accent' : 'text-muted'
              }`}
            >
              <HeartIcon size={14} filled={liked} />
              Like
              {likeCount > 0 && (
                <span className="font-normal">({likeCount})</span>
              )}
            </button>
          )}
          <span className="text-xs text-muted">
            {formatDate(comment.created_at)}
            {isEdited(comment) && ' · edited'}
          </span>
          {isAuthor && !editing && (
            <div className="ml-auto">
              <CommentMenu
                onEdit={() => {
                  setEditText(comment.content);
                  setEditing(true);
                }}
                onDelete={() => onDeleteRequest(comment)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
