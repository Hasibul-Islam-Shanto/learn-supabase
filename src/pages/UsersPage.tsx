import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DiscoverUser } from '../types';
import UserCard from '../components/user/UserCard';
import { SearchIcon } from '../components/ui/icons';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/auth-context';

interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  follower_count: { count: number }[];
}

export default function UsersPage() {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
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
      setError(true);
      setUsers([]);
      setLoading(false);
      return;
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

    setError(false);
    setUsers(mapped);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchUsers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.full_name ?? '').toLowerCase().includes(q) ||
        (u.username ?? '').toLowerCase().includes(q),
    );
  }, [query, users]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand">Find followers</h1>
            <p className="text-sm text-muted">
              Discover and connect with other members.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people"
              className="w-full rounded-full bg-canvas py-2.5 pl-10 pr-4 text-sm text-brand placeholder:text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="h-20 w-full animate-pulse bg-canvas" />
              <div className="px-4 pb-4">
                <div className="-mt-8 h-16 w-16 animate-pulse rounded-full border-4 border-white bg-canvas" />
                <div className="mt-3 h-4 w-32 animate-pulse rounded bg-canvas" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-canvas" />
                <div className="mt-4 h-8 w-full animate-pulse rounded-xl bg-canvas" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          Couldn't load people. Please try again.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          {query ? `No people match "${query}".` : 'No people to show yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
