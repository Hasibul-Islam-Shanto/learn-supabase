import { supabase } from '@/shared/lib/supabase';
import type { Message } from '@/shared/types';

const MESSAGE_SELECT = `id, conversation_id, sender_id, content, created_at,
  sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)`;

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: Message['sender'];
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as unknown as MessageRow[];
}

export async function fetchMessageById(id: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('id', id)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data as unknown as Message;
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
) {
  return supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content });
}

export function markConversationRead(conversationId: string) {
  return supabase.rpc('mark_conversation_read', {
    p_conversation_id: conversationId,
  });
}
