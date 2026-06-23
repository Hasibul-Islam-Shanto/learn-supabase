import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AppNotification } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import { BellIcon } from '@/shared/ui/icons';
import { formatDate } from '@/shared/lib/date-format';
import { useNotifications } from '../hooks/useNotifications';

function actorName(notification: AppNotification): string {
  return (
    notification.actor?.full_name ?? notification.actor?.username ?? 'Someone'
  );
}

function actionText(type: AppNotification['type']): string {
  switch (type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
  }
}

function linkTo(notification: AppNotification): string {
  if (notification.type === 'follow') {
    return `/profile/${notification.actor_id}`;
  }
  if (notification.post_id) {
    return `/post/${notification.post_id}`;
  }
  return `/profile/${notification.actor_id}`;
}

export default function NotificationsMenu() {
  const { notifications, unreadCount, loading, markAllRead, markAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleReadAll = () => {
    void markAllRead();
    setOpen(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    void markAsRead(notificationId);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-brand transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold text-brand">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleReadAll}
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                Read all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <ul className="space-y-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li
                    key={`skeleton-${i}`}
                    className="flex items-center gap-3 p-2"
                  >
                    <span className="h-9 w-9 animate-pulse rounded-full bg-canvas" />
                    <span className="h-3 w-40 animate-pulse rounded bg-canvas" />
                  </li>
                ))}
              </ul>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No notifications yet.
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => {
                  const name = actorName(notification);
                  return (
                    <li key={notification.id}>
                      <Link
                        to={linkTo(notification)}
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          handleMarkAsRead(notification.id);
                        }}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-brand-50 ${
                          notification.is_read ? '' : 'bg-brand-50/50'
                        }`}
                      >
                        <Avatar
                          src={notification.actor?.avatar_url}
                          name={name}
                          alt={name}
                          size={36}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-brand">
                            <span className="font-semibold">{name}</span>{' '}
                            {actionText(notification.type)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
