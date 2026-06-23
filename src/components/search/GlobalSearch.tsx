import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../ui/icons';
import { useAuth } from '../../context/auth-context';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePeopleSearch } from '../../hooks/usePeopleSearch';
import SearchDropdown from './SearchDropdown';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedDebounced = debouncedQuery.trim();
  const canSearch = trimmedDebounced.length >= 2;

  const { results, loading, error } = usePeopleSearch(debouncedQuery, {
    limit: 5,
    enabled: open && canSearch,
    excludeUserId: currentUserId,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  const showDropdown = open && canSearch;

  return (
    <div ref={ref} className="relative mx-2 hidden max-w-md flex-1 sm:block">
      <SearchIcon
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search people..."
        aria-label="Search people"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        className="w-full rounded-full border border-transparent bg-canvas py-2.5 pl-10 pr-4 text-sm text-brand placeholder:text-muted focus:border-brand-200 focus:bg-white focus:outline-none"
      />

      {showDropdown && (
        <SearchDropdown
          query={trimmedDebounced}
          results={results}
          loading={loading}
          error={error}
          onSelect={handleClose}
        />
      )}
    </div>
  );
}
