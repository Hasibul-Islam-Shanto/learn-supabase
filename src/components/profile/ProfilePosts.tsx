import type { PostFromRPC } from '../../types';
import PostCard from '../post/PostCard';

interface ProfilePostsProps {
  posts: PostFromRPC[];
  loading: boolean;
  isMe: boolean;
  emptyName: string;
  onEdit: (post: PostFromRPC) => void;
  onDelete: (post: PostFromRPC) => void;
  onRefetch: () => void;
}

export default function ProfilePosts({
  posts,
  loading,
  isMe,
  emptyName,
  onEdit,
  onDelete,
  onRefetch,
}: ProfilePostsProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
        Loading posts…
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
        {emptyName} hasn't posted anything yet.
      </div>
    );
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
          onRefetchPosts={onRefetch}
        />
      ))}
    </div>
  );
}
