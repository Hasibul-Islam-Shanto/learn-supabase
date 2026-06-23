import { useCallback, useEffect, useState } from 'react';
import type { AppNotification, ProfileSummary } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/auth-context';

const ACTOR_SELECT =
  'actor:profiles!notifications_actor_id_fkey(id, full_name, username, avatar_url)';

interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: AppNotification['type'];
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: ProfileSummary | null;
}

function normalize(row: NotificationRow): AppNotification {
  const actor = Array.isArray(row.actor) ? (row.actor[0] ?? null) : row.actor;
  return { ...row, actor };
}

export function useNotifications() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.reduce(
    (count, n) => count + (n.is_read ? 0 : 1),
    0,
  );

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(
          `id, recipient_id, actor_id, type, post_id, comment_id, is_read, created_at, ${ACTOR_SELECT}`,
        )
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (cancelled) return;
      if (error) {
        console.error(error);
        setNotifications([]);
      } else {
        setNotifications((data as unknown as NotificationRow[]).map(normalize));
      }
      setLoading(false);
    };

    fetchInitial();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const inserted = payload.new as NotificationRow;
          const { data, error } = await supabase
            .from('notifications')
            .select(
              `id, recipient_id, actor_id, type, post_id, comment_id, is_read, created_at, ${ACTOR_SELECT}`,
            )
            .eq('id', inserted.id)
            .single();
          if (cancelled) return;
          const next = error
            ? normalize(inserted)
            : normalize(data as unknown as NotificationRow);
          setNotifications((prev) =>
            prev.some((n) => n.id === next.id) ? prev : [next, ...prev],
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) {
        console.error(error);
        return;
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    },
    [userId],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const hasUnread = notifications.some((n) => !n.is_read);
    if (!hasUnread) return;
    setNotifications((prev) =>
      prev.map((n) => (n.is_read ? n : { ...n, is_read: true })),
    );
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    if (error) console.error(error);
  }, [userId, notifications]);

  return { notifications, unreadCount, loading, markAllRead, markAsRead };
}
