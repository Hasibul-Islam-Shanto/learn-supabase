import { useCallback, useEffect, useState } from 'react';
import type { PostFromRPC } from '@/shared/types';
import { useAuth } from '@/features/auth/context/auth-context';
import { fetchPostById } from '../api/posts';

export function usePost(id: string | undefined) {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [post, setPost] = useState<PostFromRPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const data = await fetchPostById(id, currentUserId);
      if (cancelled) return;
      setPost(data);
      setNotFound(!data);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, currentUserId]);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchPostById(id, currentUserId);
    setPost(data);
    setNotFound(!data);
    setLoading(false);
  }, [id, currentUserId]);

  return { post, loading, notFound, refetch };
}
