import type { Conversation } from '@/shared/types';
import ConversationListItem from './ConversationListItem';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeId?: string;
  currentUserId?: string;
}

export default function ConversationList({
  conversations,
  loading,
  activeId,
  currentUserId,
}: ConversationListProps) {
  if (loading) {
    return (
      <ul className="space-y-1 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={`skeleton-${i}`} className="flex items-center gap-3 p-2.5">
            <span className="h-11 w-11 animate-pulse rounded-full bg-canvas" />
            <div className="flex-1 space-y-2">
              <span className="block h-3 w-28 animate-pulse rounded bg-canvas" />
              <span className="block h-3 w-40 animate-pulse rounded bg-canvas" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted">
        No conversations yet. Visit a profile and tap Message to start one.
      </p>
    );
  }

  return (
    <ul className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <ConversationListItem
            conversation={conversation}
            active={conversation.id === activeId}
            currentUserId={currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
