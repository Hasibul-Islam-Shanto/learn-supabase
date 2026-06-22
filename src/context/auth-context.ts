import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types';

export const AuthContext = createContext<{
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);
