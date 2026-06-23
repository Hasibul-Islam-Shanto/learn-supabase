import { useEffect, useState } from 'react';
import { fetchIsFollowing } from '../api/profile';
import { useToggleFollow } from './useToggleFollow';

interface UseFollowOptions {
  targetUserId: string | undefined;
  currentUserId: string | undefined;
  followerCount: number;
}

export function useFollow({
  targetUserId,
  currentUserId,
  followerCount,
}: UseFollowOptions) {
  const [initialFollowing, setInitialFollowing] = useState(false);
  const canFollow = Boolean(
    targetUserId && currentUserId && currentUserId !== targetUserId,
  );

  useEffect(() => {
    if (!canFollow || !targetUserId || !currentUserId) return;

    let cancelled = false;
    fetchIsFollowing(currentUserId, targetUserId).then((value) => {
      if (!cancelled) setInitialFollowing(value);
    });
    return () => {
      cancelled = true;
    };
  }, [targetUserId, currentUserId, canFollow]);

  const {
    following,
    followerCount: liveCount,
    pending,
    toggle,
  } = useToggleFollow({
    targetUserId: targetUserId ?? '',
    currentUserId,
    initialFollowing: canFollow ? initialFollowing : false,
    initialFollowerCount: followerCount,
  });

  return {
    isFollowing: following,
    followerCount: liveCount,
    followPending: pending,
    toggleFollow: toggle,
  };
}
