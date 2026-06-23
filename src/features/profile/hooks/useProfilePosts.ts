import { useCallback, useEffect, useState } from 'react';
import type { PostFromRPC } from '@/shared/types';
import { fetchPostsByAuthor } from '@/features/posts/api/posts';

export function useProfilePosts(
  profileId: string | undefined,
  currentUserId: string | undefined,
) {
  const [posts, setPosts] = useState<PostFromRPC[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const data = await fetchPostsByAuthor(profileId, currentUserId);
      if (cancelled) return;
      setPosts(data);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId, currentUserId]);

  const refetch = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    const data = await fetchPostsByAuthor(profileId, currentUserId);
    setPosts(data);
    setLoading(false);
  }, [profileId, currentUserId]);

  return { posts, loading, refetch };
}
