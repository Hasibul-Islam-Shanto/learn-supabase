import { useState } from 'react';
import toast from 'react-hot-toast';
import { setFollow } from '../api/follows';

interface UseToggleFollowOptions {
  targetUserId: string;
  currentUserId?: string;
  initialFollowing: boolean;
  initialFollowerCount?: number;
}

export function useToggleFollow({
  targetUserId,
  currentUserId,
  initialFollowing,
  initialFollowerCount = 0,
}: UseToggleFollowOptions) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [pending, setPending] = useState(false);
  const syncKey = `${targetUserId}:${initialFollowing}:${initialFollowerCount}`;
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey);

  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    setFollowing(initialFollowing);
    setFollowerCount(initialFollowerCount);
  }

  const toggle = async () => {
    if (!currentUserId || currentUserId === targetUserId || pending) return;
    const next = !following;
    setFollowing(next);
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setPending(true);

    const { error } = await setFollow(currentUserId, targetUserId, next);
    setPending(false);

    if (error) {
      setFollowing(!next);
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(error.message);
    }
  };

  return { following, followerCount, pending, toggle };
}
