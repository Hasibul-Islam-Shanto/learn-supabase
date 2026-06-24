import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Message } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/features/auth/context/auth-context';
import { fetchMessageById, fetchMessages, sendMessage } from '../api/messages';

export function useMessages(conversationId: string | undefined) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const data = await fetchMessages(conversationId);
      if (cancelled) return;
      setMessages(data);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const inserted = payload.new as { id: string };
          const full = await fetchMessageById(inserted.id);
          if (cancelled || !full) return;
          setMessages((prev) =>
            prev.some((m) => m.id === full.id) ? prev : [...prev, full],
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const send = useCallback(
    async (content: string): Promise<boolean> => {
      const text = content.trim();
      if (!text || !conversationId || !userId) return false;
      const { error } = await sendMessage(conversationId, userId, text);
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    },
    [conversationId, userId],
  );

  return { messages, loading, currentUserId: userId, send };
}
