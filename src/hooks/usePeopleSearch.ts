import { useEffect, useState } from 'react';
import type { SearchUserResult } from '../types';
import { searchProfiles } from '../utils/search';

interface UsePeopleSearchOptions {
  limit?: number;
  enabled?: boolean;
  excludeUserId?: string;
  minLength?: number;
}

export function usePeopleSearch(
  query: string,
  {
    limit = 10,
    enabled = true,
    excludeUserId,
    minLength = 2,
  }: UsePeopleSearchOptions = {},
) {
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < minLength) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const run = async () => {
      const { data, error: fetchError } = await searchProfiles(
        trimmed,
        limit,
        excludeUserId,
      );
      if (cancelled) return;
      if (fetchError) {
        console.error(fetchError);
        setError(true);
        setResults([]);
      } else {
        setError(false);
        setResults(data);
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [query, limit, enabled, excludeUserId, minLength]);

  return { results, loading, error };
}
