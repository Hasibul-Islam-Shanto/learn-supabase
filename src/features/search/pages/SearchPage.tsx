import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon } from '@/shared/ui/icons';
import EmptyState from '@/shared/components/EmptyState';
import UserListSkeleton from '@/shared/components/UserListSkeleton';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useAuth } from '@/features/auth/context/auth-context';
import { usePeopleSearch } from '../hooks/usePeopleSearch';
import SearchUserResultItem from '../components/SearchUserResultItem';

export default function SearchPage() {
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const current = searchParams.get('q') ?? '';
    if (trimmed === current) return;
    if (trimmed) {
      setSearchParams({ q: trimmed }, { replace: true });
    } else if (current) {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, searchParams, setSearchParams]);

  const trimmedDebounced = debouncedQuery.trim();
  const canSearch = trimmedDebounced.length >= 2;

  const { results, loading, error } = usePeopleSearch(debouncedQuery, {
    limit: 20,
    enabled: canSearch,
    excludeUserId: currentUserId,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand">Search results</h1>
            <p className="text-sm text-muted">
              Search for people by name or username.
            </p>
          </div>
          <div className="relative w-full sm:max-w-md">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              aria-label="Search people"
              className="w-full rounded-full bg-canvas py-2.5 pl-10 pr-4 text-sm text-brand placeholder:text-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      {!canSearch ? (
        <EmptyState>
          Type at least 2 characters to search for people.
        </EmptyState>
      ) : loading ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <UserListSkeleton count={6} className="space-y-1" />
        </div>
      ) : error ? (
        <EmptyState>Couldn't load search results. Please try again.</EmptyState>
      ) : results.length === 0 ? (
        <EmptyState>
          No people found for &ldquo;{trimmedDebounced}&rdquo;.
        </EmptyState>
      ) : (
        <div className="rounded-2xl bg-white p-2 shadow-sm">
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                <SearchUserResultItem user={user} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
