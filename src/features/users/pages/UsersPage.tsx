import { useMemo, useState } from 'react';
import { SearchIcon } from '@/shared/ui/icons';
import EmptyState from '@/shared/components/EmptyState';
import UserCard from '../components/UserCard';
import { useDiscoverUsers } from '../hooks/useDiscoverUsers';

export default function UsersPage() {
  const { users, loading, error } = useDiscoverUsers();
  const [query, setQuery] = useState('');

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
        <EmptyState>Couldn't load people. Please try again.</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>
          {query ? `No people match "${query}".` : 'No people to show yet.'}
        </EmptyState>
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
