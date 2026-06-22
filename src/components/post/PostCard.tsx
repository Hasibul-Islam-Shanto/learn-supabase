import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostFromRPC } from '../../types';
import Avatar from '../ui/Avatar';
import PostMenu from './PostMenu';
import CommentSection from './CommentSection';
import { CommentIcon, HeartIcon, ShareIcon } from '../ui/icons';
import { formatDate } from '../../utils/date-format';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/auth-context';

interface PostCardProps {
  post: PostFromRPC;
  canManage?: boolean;
  onEdit?: (post: PostFromRPC) => void;
  onDelete?: (post: PostFromRPC) => void;
  onRefetchPosts: () => void;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function PostCard({
  post,
  canManage = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const { session } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const handleLike = async () => {
    if (!session?.user.id) return;
    setLiked((v) => !v);
    setLikeCount((v) => (liked ? v - 1 : v + 1));

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', session.user.id);
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: session.user.id });
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link to={`/profile/${post.author?.id}`}>
          <Avatar
            src={post.author?.avatar_url ?? '/default-avatar.png'}
            alt={post.author?.full_name ?? ''}
            size={44}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${post.author?.id}`}
            className="block truncate font-semibold text-brand hover:underline"
          >
            {post.author?.full_name ?? post.author?.username}
          </Link>
          <p className="text-xs text-muted">{formatDate(post.created_at)}</p>
        </div>
        {canManage && (
          <PostMenu
            onEdit={() => onEdit?.(post)}
            onDelete={() => onDelete?.(post)}
          />
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pt-3 text-[15px] leading-relaxed text-brand-900">
          {post.content}
        </p>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="mt-3">
          <img
            src={post.image_url}
            alt=""
            className="max-h-[460px] w-full object-cover"
          />
        </div>
      )}

      {/* Like / comment summary */}
      <div className="flex items-center gap-4 px-4 py-3 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <HeartIcon size={16} className="text-accent" filled />
          {formatCount(likeCount)}
        </span>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 hover:underline"
        >
          <CommentIcon size={16} />
          {formatCount(commentCount)}{' '}
          {commentCount === 1 ? 'comment' : 'comments'}
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <ShareIcon size={16} /> {formatCount(0)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="mx-4 grid grid-cols-3 gap-1 border-t border-line py-1">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors hover:bg-brand-50 ${
            liked ? 'text-accent' : 'text-muted'
          }`}
        >
          <HeartIcon size={18} filled={liked} /> Like
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors hover:bg-brand-50 ${
            commentsOpen ? 'text-brand' : 'text-muted'
          }`}
        >
          <CommentIcon size={18} /> Comment
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-muted transition-colors hover:bg-brand-50"
        >
          <ShareIcon size={18} /> Share
        </button>
      </div>

      {/* Comment section */}
      {commentsOpen && (
        <CommentSection
          postId={post.id}
          initialCount={commentCount}
          onCountChange={(delta) => setCommentCount((v) => v + delta)}
        />
      )}
    </article>
  );
}
