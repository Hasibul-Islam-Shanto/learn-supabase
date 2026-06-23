import type { PostFromRPC } from '@/shared/types';
import EmptyState from '@/shared/components/EmptyState';
import LoadingPanel from '@/shared/components/LoadingPanel';
import PostCard from '@/features/posts/components/PostCard';

interface ProfilePostsProps {
  posts: PostFromRPC[];
  loading: boolean;
  isMe: boolean;
  emptyName: string;
  onEdit: (post: PostFromRPC) => void;
  onDelete: (post: PostFromRPC) => void;
}

export default function ProfilePosts({
  posts,
  loading,
  isMe,
  emptyName,
  onEdit,
  onDelete,
}: ProfilePostsProps) {
  if (loading) {
    return <LoadingPanel message="Loading posts…" />;
  }

  if (posts.length === 0) {
    return <EmptyState>{emptyName} hasn't posted anything yet.</EmptyState>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canManage={isMe}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
