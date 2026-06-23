import { supabase } from '@/shared/lib/supabase';
import type { ProfileSummary } from '@/shared/types';

export type FollowListType = 'followers' | 'following';

const PROFILE_SELECT = 'id, full_name, username, avatar_url';

export async function fetchFollowList(
  profileId: string,
  type: FollowListType,
  limit?: number,
): Promise<{ data: ProfileSummary[]; error: unknown }> {
  const relation =
    type === 'followers'
      ? `follower:profiles!follows_follower_id_fkey(${PROFILE_SELECT})`
      : `following:profiles!follows_following_id_fkey(${PROFILE_SELECT})`;
  const filterColumn = type === 'followers' ? 'following_id' : 'follower_id';

  let query = supabase
    .from('follows')
    .select(relation)
    .eq(filterColumn, profileId)
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return { data: [], error };

  const key = type === 'followers' ? 'follower' : 'following';
  const list = (data ?? [])
    .map(
      (row) => (row as unknown as Record<string, ProfileSummary | null>)[key],
    )
    .filter((p): p is ProfileSummary => Boolean(p));
  return { data: list, error: null };
}

export function setFollow(
  followerId: string,
  followingId: string,
  follow: boolean,
) {
  return follow
    ? supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
    : supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
}
