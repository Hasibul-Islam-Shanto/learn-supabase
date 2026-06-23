import { useCallback, useEffect, useState } from 'react';
import type { DiscoverUser } from '@/shared/types';
import { useAuth } from '@/features/auth/context/auth-context';
import { fetchDiscoverUsers } from '../api/users';

export function useDiscoverUsers() {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } =
        await fetchDiscoverUsers(currentUserId);
      if (cancelled) return;
      if (fetchError) {
        setError(true);
        setUsers([]);
      } else {
        setError(false);
        setUsers(data);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchDiscoverUsers(currentUserId);
    if (fetchError) {
      setError(true);
      setUsers([]);
    } else {
      setError(false);
      setUsers(data);
    }
    setLoading(false);
  }, [currentUserId]);

  return { users, loading, error, refetch };
}
