/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Comment } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { HeartIcon } from '../ui/icons';
import { formatDate } from '../../utils/date-format';
import { supabase } from '../../utils/supabase';
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
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLiked(comment.liked_by_me);
    setLikeCount(comment.like_count);
  }, [comment.id, comment.liked_by_me, comment.like_count]);

  useEffect(() => {
    setEditText(comment.content);
    setEditing(false);
  }, [comment.id, comment.content]);

  const isAuthor = currentUserId === comment.author_id;
  const name = comment.author?.full_name ?? comment.author?.username ?? 'User';

  const handleLike = async () => {
    if (!currentUserId) return;
    const next = !liked;
    const newCount = Math.max(0, likeCount + (next ? 1 : -1));
    setLiked(next);
    setLikeCount(newCount);

    const { error } = next
      ? await supabase
          .from('comment_likes')
          .insert({ comment_id: comment.id, user_id: currentUserId })
      : await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', currentUserId);

    if (error) {
      setLiked(!next);
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(error.message);
      return;
    }

    onUpdate({
      ...comment,
      liked_by_me: next,
      like_count: newCount,
    });
  };

  const handleSaveEdit = async () => {
    const text = editText.trim();
    if (!text || !currentUserId || !isAuthor) return;
    setSaving(true);
    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from('comments')
      .update({ content: text, updated_at: updatedAt })
      .eq('id', comment.id)
      .eq('author_id', currentUserId);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    const updated: Comment = {
      ...comment,
      content: text,
      updated_at: updatedAt,
    };
    onUpdate(updated);
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
              onClick={handleLike}
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
