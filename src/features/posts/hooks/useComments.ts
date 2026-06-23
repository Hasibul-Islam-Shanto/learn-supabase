import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Comment } from '@/shared/types';
import { useAuth } from '@/features/auth/context/auth-context';
import { addComment, deleteComment, fetchComments } from '../api/comments';

export function useComments(postId: string) {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await fetchComments(postId, currentUserId);
      if (cancelled) return;
      setComments(data);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [postId, currentUserId]);

  const refetch = useCallback(async () => {
    const data = await fetchComments(postId, currentUserId);
    setComments(data);
    setLoading(false);
  }, [postId, currentUserId]);

  const submit = useCallback(
    async (content: string): Promise<boolean> => {
      const text = content.trim();
      if (!text || !currentUserId) return false;
      const { error } = await addComment(postId, currentUserId, text);
      if (error) {
        toast.error(error.message);
        return false;
      }
      await refetch();
      return true;
    },
    [postId, currentUserId, refetch],
  );

  const remove = useCallback(
    async (comment: Comment): Promise<boolean> => {
      if (!currentUserId) return false;
      const { error } = await deleteComment(comment.id, currentUserId);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      toast.success('Comment deleted');
      return true;
    },
    [currentUserId],
  );

  const applyUpdate = useCallback((updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  return { comments, loading, currentUserId, submit, remove, applyUpdate };
}
