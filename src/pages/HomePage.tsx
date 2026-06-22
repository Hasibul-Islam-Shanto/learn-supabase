import { useCallback, useEffect, useState } from 'react';
import type { PostFromRPC } from '../types';
import CreatePostBox from '../components/post/CreatePostBox';
import PostCard from '../components/post/PostCard';
import PostComposer from '../components/post/PostComposer';
import DeleteConfirm from '../components/post/DeleteConfirm';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/auth-context';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostFromRPC | null>(null);
  const [allPosts, setAllPosts] = useState<PostFromRPC[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_posts', {
        p_user_id: session.user.id,
      });

      if (error) console.error(error);
      setAllPosts((data as PostFromRPC[]) ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const openCreate = () => {
    setEditingPost(null);
    setComposerOpen(true);
  };

  const openEdit = (post: PostFromRPC) => {
    setEditingPost(post);
    setComposerOpen(true);
  };

  useEffect(() => {
    fetchPosts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchPosts]);

  const handleRefetchPosts = () => {
    fetchPosts();
  };

  const handleDeletePost = async (post: PostFromRPC) => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) console.error(error);
    handleRefetchPosts();
    setDeletingPost(null);
    toast.success('Post deleted successfully');
  };

  return (
    <div className="space-y-4">
      <CreatePostBox onOpen={openCreate} />
      {loading && (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          <span className="text-brand">Loading posts...</span>
        </div>
      )}
      {allPosts?.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          No posts found
        </div>
      )}
      {allPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canManage={post.author_id === session?.user.id}
          onEdit={openEdit}
          onDelete={() => handleDeletePost(post)}
          onRefetchPosts={handleRefetchPosts}
        />
      ))}

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        editingPost={editingPost}
        refetchPosts={fetchPosts}
      />
      <DeleteConfirm
        open={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        onConfirm={() => setDeletingPost(null)}
      />
    </div>
  );
}
