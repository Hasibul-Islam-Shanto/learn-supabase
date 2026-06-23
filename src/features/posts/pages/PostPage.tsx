import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { PostFromRPC } from '@/shared/types';
import EmptyState from '@/shared/components/EmptyState';
import LoadingPanel from '@/shared/components/LoadingPanel';
import { useAuth } from '@/features/auth/context/auth-context';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import { usePost } from '../hooks/usePost';
import { deletePost } from '../api/posts';

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const { post, loading, notFound, refetch } = usePost(id);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);

  const handleDelete = async (target: PostFromRPC) => {
    const { error } = await deletePost(target.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Post deleted successfully');
    navigate('/');
  };

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <span aria-hidden>&larr;</span> Back to feed
      </Link>

      {loading ? (
        <LoadingPanel message="Loading post..." />
      ) : notFound || !post ? (
        <EmptyState>This post is no longer available.</EmptyState>
      ) : (
        <>
          <PostCard
            post={post}
            canManage={post.author_id === currentUserId}
            onEdit={setEditingPost}
            onDelete={handleDelete}
          />
          <PostComposer
            open={Boolean(editingPost)}
            onClose={() => setEditingPost(null)}
            editingPost={editingPost}
            refetchPosts={refetch}
          />
        </>
      )}
    </div>
  );
}
