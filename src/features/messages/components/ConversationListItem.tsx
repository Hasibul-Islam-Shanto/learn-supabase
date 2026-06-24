import { Link } from 'react-router-dom';
import type { Conversation } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import { formatDate } from '@/shared/lib/date-format';

interface ConversationListItemProps {
  conversation: Conversation;
  active: boolean;
  currentUserId?: string;
}

export default function ConversationListItem({
  conversation,
  active,
  currentUserId,
}: ConversationListItemProps) {
  const {
    other_user: other,
    last_message: last,
    unread_count: unread,
  } = conversation;
  const name = other.full_name ?? other.username ?? 'User';
  const isMine = last?.sender_id === currentUserId;
  const preview = last
    ? `${isMine ? 'You: ' : ''}${last.content}`
    : 'No messages yet';

  return (
    <Link
      to={`/messages/${conversation.id}`}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50 ${
        active ? 'bg-brand-50' : ''
      }`}
    >
      <Avatar src={other.avatar_url} name={name} alt={name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-brand">
            {name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm ${
              unread > 0 ? 'font-semibold text-brand-900' : 'text-muted'
            }`}
          >
            {preview}
          </p>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        <span>
          {last && (
            <span className="shrink-0 text-[10px] text-muted">
              {formatDate(last.created_at)}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
