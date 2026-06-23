import { useEffect, useState } from 'react';
import type { ProfileSummary } from '@/shared/types';
import { fetchFollowList, type FollowListType } from '../api/follows';

export type { FollowListType };

export function useFollowList(
  profileId: string | undefined,
  type: FollowListType,
  enabled: boolean,
  limit?: number,
) {
  const [users, setUsers] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const active = enabled && Boolean(profileId);

  useEffect(() => {
    if (!active || !profileId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      const { data, error: fetchError } = await fetchFollowList(
        profileId,
        type,
        limit,
      );
      if (cancelled) return;
      if (fetchError) {
        setError(true);
        setUsers([]);
      } else {
        setError(false);
        setUsers(data);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId, type, active, limit]);

  return {
    users: active ? users : [],
    loading: active ? loading : false,
    error: active ? error : false,
  };
}
