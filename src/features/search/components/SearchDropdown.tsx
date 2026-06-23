import { Link } from 'react-router-dom';
import type { SearchUserResult } from '@/shared/types';
import UserListSkeleton from '@/shared/components/UserListSkeleton';
import SearchUserResultItem from './SearchUserResultItem';

interface SearchDropdownProps {
  query: string;
  results: SearchUserResult[];
  loading: boolean;
  error: boolean;
  onSelect: () => void;
}

export default function SearchDropdown({
  query,
  results,
  loading,
  error,
  onSelect,
}: SearchDropdownProps) {
  const encodedQuery = encodeURIComponent(query.trim());

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
      <div className="max-h-80 overflow-y-auto p-2">
        {loading ? (
          <UserListSkeleton count={3} className="space-y-1" />
        ) : error ? (
          <p className="px-3 py-4 text-center text-sm text-muted">
            Couldn't load search results.
          </p>
        ) : results.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted">
            No people found for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                <SearchUserResultItem user={user} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && !error && results.length > 0 && (
        <div className="border-t border-line px-3 py-2">
          <Link
            to={`/search?q=${encodedQuery}`}
            onClick={onSelect}
            className="block rounded-lg px-2 py-2 text-center text-sm font-semibold text-accent transition-colors hover:bg-accent-50"
          >
            See all results
          </Link>
        </div>
      )}
    </div>
  );
}
