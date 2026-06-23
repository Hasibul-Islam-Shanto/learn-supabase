import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { AuthContext } from '@/features/auth/context/auth-context';
import type { Profile } from '@/shared/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Profile;
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const [prevUserId, setPrevUserId] = useState(userId);

  if (userId !== prevUserId) {
    setPrevUserId(userId);
    if (!userId) setProfile(null);
  }

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const load = async () => {
      const data = await fetchProfile(userId);
      if (cancelled || !data) return;
      setProfile(data);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const data = await fetchProfile(userId);
    if (data) setProfile(data);
  }, [userId, fetchProfile]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
