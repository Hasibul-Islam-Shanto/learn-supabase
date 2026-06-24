import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/features/auth/context/auth-context';
import { fetchConversations } from '@/features/messages/api/conversations';
import { markConversationRead } from '@/features/messages/api/messages';
import { MessagesContext } from '@/features/messages/context/messages-context';

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const activeIdRef = useRef<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;
    const data = await fetchConversations(userId);
    const activeId = activeIdRef.current;
    setConversations(
      activeId
        ? data.map((c) => (c.id === activeId ? { ...c, unread_count: 0 } : c))
        : data,
    );
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async (initial: boolean) => {
      if (initial) setLoading(true);
      const data = await fetchConversations(userId);
      if (cancelled) return;
      const activeId = activeIdRef.current;
      setConversations(
        activeId
          ? data.map((c) => (c.id === activeId ? { ...c, unread_count: 0 } : c))
          : data,
      );
      setLoading(false);
      if (activeId) void markConversationRead(activeId);
    };

    load(true);

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => load(false),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markRead = useCallback(async (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c,
      ),
    );
    await markConversationRead(conversationId);
  }, []);

  const setActiveConversation = useCallback(
    (conversationId: string | null) => {
      activeIdRef.current = conversationId;
      if (conversationId) void markRead(conversationId);
    },
    [markRead],
  );

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const value = useMemo(
    () => ({
      conversations: userId ? conversations : [],
      loading: userId ? loading : false,
      unreadTotal: userId ? unreadTotal : 0,
      refetch,
      markRead,
      setActiveConversation,
    }),
    [
      userId,
      conversations,
      loading,
      unreadTotal,
      refetch,
      markRead,
      setActiveConversation,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}
