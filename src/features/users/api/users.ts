import { supabase } from '@/shared/lib/supabase';
import type { DiscoverUser } from '@/shared/types';

interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  follower_count: { count: number }[];
}

export async function fetchDiscoverUsers(
  currentUserId?: string,
): Promise<{ data: DiscoverUser[]; error: unknown }> {
  const [profilesRes, followingRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        `id, full_name, username, avatar_url, cover_url, bio,
        follower_count:follows!follows_following_id_fkey(count)`,
      )
      .order('created_at', { ascending: false }),
    currentUserId
      ? supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId)
      : Promise.resolve({
          data: [] as { following_id: string }[],
          error: null,
        }),
  ]);

  if (profilesRes.error) {
    console.error(profilesRes.error);
    return { data: [], error: profilesRes.error };
  }

  const followingIds = new Set(
    (followingRes.data ?? []).map((f) => f.following_id),
  );

  const mapped: DiscoverUser[] = (profilesRes.data as ProfileRow[])
    .filter((row) => row.id !== currentUserId)
    .map((row) => ({
      id: row.id,
      full_name: row.full_name,
      username: row.username,
      avatar_url: row.avatar_url,
      cover_url: row.cover_url,
      bio: row.bio,
      follower_count: row.follower_count[0]?.count ?? 0,
      is_following: followingIds.has(row.id),
    }));

  return { data: mapped, error: null };
}
