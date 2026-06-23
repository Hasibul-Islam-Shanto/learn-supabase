import { useState } from 'react';
import toast from 'react-hot-toast';
import type { PostFromRPC } from '@/shared/types';
import EmptyState from '@/shared/components/EmptyState';
import LoadingPanel from '@/shared/components/LoadingPanel';
import { useAuth } from '@/features/auth/context/auth-context';
import CreatePostBox from '../components/CreatePostBox';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import DeleteConfirm from '../components/DeleteConfirm';
import { usePostsFeed } from '../hooks/usePostsFeed';
import { deletePost } from '../api/posts';

export default function HomePage() {
  const { session } = useAuth();
  const { posts, loading, refetch } = usePostsFeed();

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostFromRPC | null>(null);

  const openCreate = () => {
    setEditingPost(null);
    setComposerOpen(true);
  };

  const openEdit = (post: PostFromRPC) => {
    setEditingPost(post);
    setComposerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return;
    const { error } = await deletePost(deletingPost.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDeletingPost(null);
    toast.success('Post deleted successfully');
    refetch();
  };

  return (
    <div className="space-y-4">
      <CreatePostBox onOpen={openCreate} />

      {loading && <LoadingPanel message="Loading posts..." />}

      {!loading && posts.length === 0 && (
        <EmptyState>No posts found</EmptyState>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canManage={post.author_id === session?.user.id}
          onEdit={openEdit}
          onDelete={setDeletingPost}
        />
      ))}

      <PostComposer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        refetchPosts={refetch}
      />
      <DeleteConfirm
        open={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
