import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProfileSummary } from '../../types';
import Avatar from '../ui/Avatar';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/auth-context';

export default function RightRail() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [followers, setFollowers] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!userId) {
        setFollowers([]);
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select(
          'follower:profiles!follows_follower_id_fkey(id, full_name, username, avatar_url)',
        )
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(8);
      if (cancelled) return;
      if (fetchError) {
        console.error(fetchError);
        setError(true);
        setFollowers([]);
      } else {
        const list = (data ?? [])
          .map(
            (row) =>
              (row as unknown as { follower: ProfileSummary | null }).follower,
          )
          .filter((p): p is ProfileSummary => Boolean(p));
        setError(false);
        setFollowers(list);
      }
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Your followers
          </h3>

          {loading ? (
            <ul className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="flex items-center gap-3">
                  <span className="h-9 w-9 animate-pulse rounded-full bg-canvas" />
                  <span className="h-3 w-28 animate-pulse rounded bg-canvas" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <p className="text-sm text-muted">Couldn't load followers.</p>
          ) : followers.length === 0 ? (
            <p className="text-sm text-muted">No followers yet.</p>
          ) : (
            <ul className="space-y-1">
              {followers.map((follower) => {
                const name = follower.full_name ?? follower.username ?? 'User';
                return (
                  <li key={follower.id}>
                    <Link
                      to={`/profile/${follower.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50"
                    >
                      <Avatar
                        src={follower.avatar_url}
                        name={name}
                        alt={name}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand">
                          {name}
                        </p>
                        {follower.username && (
                          <p className="truncate text-xs text-muted">
                            @{follower.username}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
