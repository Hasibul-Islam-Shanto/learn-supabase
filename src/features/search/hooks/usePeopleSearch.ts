import { useEffect, useState } from 'react';
import type { SearchUserResult } from '@/shared/types';
import { searchProfiles } from '../api/search';

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
  const trimmed = query.trim();
  const active = enabled && trimmed.length >= minLength;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(false);
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
  }, [trimmed, limit, active, excludeUserId]);

  return {
    results: active ? results : [],
    loading: active ? loading : false,
    error: active ? error : false,
  };
}
