import type { SearchUserResult } from '../types';
import { supabase } from './supabase';

function sanitizeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

export async function searchProfiles(
  query: string,
  limit = 10,
  excludeUserId?: string,
) {
  const q = query.trim();
  if (!q) return { data: [] as SearchUserResult[], error: null };

  const pattern = sanitizeIlikePattern(q);
  let request = supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, bio')
    .or(`full_name.ilike.%${pattern}%,username.ilike.%${pattern}%`)
    .order('full_name', { ascending: true })
    .limit(limit);

  if (excludeUserId) {
    request = request.neq('id', excludeUserId);
  }

  const { data, error } = await request;
  return { data: (data ?? []) as SearchUserResult[], error };
}
