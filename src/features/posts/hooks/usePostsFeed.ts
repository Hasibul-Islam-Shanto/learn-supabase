import { useCallback, useEffect, useState } from 'react';
import type { PostFromRPC } from '@/shared/types';
import { useAuth } from '@/features/auth/context/auth-context';
import { fetchPostsFeed } from '../api/posts';

export function usePostsFeed() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [posts, setPosts] = useState<PostFromRPC[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const data = await fetchPostsFeed(userId);
      if (cancelled) return;
      setPosts(data);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await fetchPostsFeed(userId);
    setPosts(data);
    setLoading(false);
  }, [userId]);

  return { posts, loading, refetch };
}
