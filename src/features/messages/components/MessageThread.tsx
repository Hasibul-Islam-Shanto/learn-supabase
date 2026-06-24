import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Conversation, ProfileSummary } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import { useMessages } from '../hooks/useMessages';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

interface MessageThreadProps {
  conversationId: string;
  conversation?: Conversation;
}

export default function MessageThread({
  conversationId,
  conversation,
}: MessageThreadProps) {
  const { messages, loading, currentUserId, send } =
    useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherFromMessages = messages.find(
    (m) => m.sender_id !== currentUserId,
  )?.sender;
  const other: ProfileSummary | null =
    conversation?.other_user ?? otherFromMessages ?? null;
  const name = other?.full_name ?? other?.username ?? 'Conversation';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link to="/messages" className="text-brand lg:hidden" aria-label="Back">
          &larr;
        </Link>
        {other ? (
          <Link
            to={`/profile/${other.id}`}
            className="flex items-center gap-3 hover:underline"
          >
            <Avatar src={other.avatar_url} name={name} alt={name} size={36} />
            <span className="text-sm font-semibold text-brand">{name}</span>
          </Link>
        ) : (
          <span className="text-sm font-semibold text-brand">{name}</span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={send} />
    </div>
  );
}
