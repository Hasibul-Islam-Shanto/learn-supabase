import { supabase } from '@/shared/lib/supabase';
import type { Conversation } from '@/shared/types';

interface ConversationRow {
  conversation_id: string;
  updated_at: string;
  other_user: Conversation['other_user'];
  last_message: Conversation['last_message'];
  unread_count: number;
}

export async function fetchConversations(
  userId: string,
): Promise<Conversation[]> {
  const { data, error } = await supabase.rpc('get_conversations', {
    p_user_id: userId,
  });
  if (error) {
    console.error(error);
    return [];
  }
  return ((data as ConversationRow[]) ?? []).map((row) => ({
    id: row.conversation_id,
    updated_at: row.updated_at,
    other_user: row.other_user,
    last_message: row.last_message,
    unread_count: Number(row.unread_count) || 0,
  }));
}

export async function getOrCreateConversation(
  otherUserId: string,
): Promise<{ conversationId: string | null; error: unknown }> {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_other_user_id: otherUserId,
  });
  if (error) return { conversationId: null, error };
  return { conversationId: data as string, error: null };
}
