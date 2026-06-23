import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon } from '../components/ui/icons';
import SearchUserResultItem from '../components/search/SearchUserResultItem';
import { useAuth } from '../context/auth-context';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePeopleSearch } from '../hooks/usePeopleSearch';

export default function SearchPage() {
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(urlQuery);
  }, [urlQuery]);

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
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          Type at least 2 characters to search for people.
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <ul className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={`skeleton-${i}`}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span className="h-10 w-10 animate-pulse rounded-full bg-canvas" />
                <span className="h-3 w-40 animate-pulse rounded bg-canvas" />
              </li>
            ))}
          </ul>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          Couldn't load search results. Please try again.
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          No people found for &ldquo;{trimmedDebounced}&rdquo;.
        </div>
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
