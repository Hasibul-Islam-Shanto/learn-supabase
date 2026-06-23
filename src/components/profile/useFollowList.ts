/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import type { ProfileSummary } from '../../types';
import { supabase } from '../../utils/supabase';

export type FollowListType = 'followers' | 'following';

const PROFILE_SELECT = 'id, full_name, username, avatar_url';

interface UseFollowListResult {
  users: ProfileSummary[];
  loading: boolean;
  error: boolean;
}

export function useFollowList(
  profileId: string | undefined,
  type: FollowListType,
  enabled: boolean,
): UseFollowListResult {
  const [users, setUsers] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || !profileId) {
      setUsers([]);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const run = async () => {
      const query =
        type === 'followers'
          ? supabase
              .from('follows')
              .select(
                `follower:profiles!follows_follower_id_fkey(${PROFILE_SELECT})`,
              )
              .eq('following_id', profileId)
              .order('created_at', { ascending: false })
          : supabase
              .from('follows')
              .select(
                `following:profiles!follows_following_id_fkey(${PROFILE_SELECT})`,
              )
              .eq('follower_id', profileId)
              .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        console.error(fetchError);
        setError(true);
        setUsers([]);
      } else {
        const key = type === 'followers' ? 'follower' : 'following';
        const list = (data ?? [])
          .map(
            (row) =>
              (row as unknown as Record<string, ProfileSummary | null>)[key],
          )
          .filter((p): p is ProfileSummary => Boolean(p));
        setError(false);
        setUsers(list);
      }
      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [profileId, type, enabled]);

  return { users, loading, error };
}
