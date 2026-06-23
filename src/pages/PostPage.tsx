import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { PostFromRPC } from '../types';
import PostCard from '../components/post/PostCard';
import PostComposer from '../components/post/PostComposer';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/auth-context';

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [post, setPost] = useState<PostFromRPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [postRes, likedRes] = await Promise.all([
      supabase
        .from('posts')
        .select(
          `*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
          like_count:likes(count), comment_count:comments(count)`,
        )
        .eq('id', id)
        .maybeSingle(),
      currentUserId
        ? supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUserId)
            .eq('post_id', id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (postRes.error) console.error(postRes.error);
    if (!postRes.data) {
      setPost(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    const raw = postRes.data;
    setPost({
      ...raw,
      like_count:
        (raw.like_count as unknown as { count: number }[])[0]?.count ?? 0,
      comment_count:
        (raw.comment_count as unknown as { count: number }[])[0]?.count ?? 0,
      liked_by_me: Boolean(likedRes.data),
    } as PostFromRPC);
    setNotFound(false);
    setLoading(false);
  }, [id, currentUserId]);

  useEffect(() => {
    fetchPost(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchPost]);

  const handleDelete = async (target: PostFromRPC) => {
    const { error } = await supabase.from('posts').delete().eq('id', target.id);
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
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          <span className="text-brand">Loading post...</span>
        </div>
      ) : notFound || !post ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          This post is no longer available.
        </div>
      ) : (
        <>
          <PostCard
            post={post}
            canManage={post.author_id === currentUserId}
            onEdit={setEditingPost}
            onDelete={handleDelete}
            onRefetchPosts={fetchPost}
          />
          <PostComposer
            open={Boolean(editingPost)}
            onClose={() => setEditingPost(null)}
            editingPost={editingPost}
            refetchPosts={fetchPost}
          />
        </>
      )}
    </div>
  );
}
