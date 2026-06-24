import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/auth-context';
import { useMessagesContext } from '../context/messages-context';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { session } = useAuth();
  const currentUserId = session?.user.id;
  const { conversations, loading, refetch, setActiveConversation } =
    useMessagesContext();

  useEffect(() => {
    setActiveConversation(conversationId ?? null);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  useEffect(() => {
    if (
      conversationId &&
      !loading &&
      !conversations.some((c) => c.id === conversationId)
    ) {
      void refetch();
    }
  }, [conversationId, conversations, loading, refetch]);

  const activeConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-2">
      <aside
        className={`w-full overflow-hidden rounded-2xl bg-white shadow-sm lg:w-60 lg:shrink-0 ${
          conversationId ? 'hidden lg:block' : 'block'
        }`}
      >
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-lg font-bold text-brand">Messages</h1>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
          <ConversationList
            conversations={conversations}
            loading={loading}
            activeId={conversationId}
            currentUserId={currentUserId}
          />
        </div>
      </aside>

      <section
        className={`flex-1 overflow-hidden rounded-2xl bg-white shadow-sm ${
          conversationId ? 'block' : 'hidden lg:block'
        }`}
      >
        {conversationId ? (
          <MessageThread
            key={conversationId}
            conversationId={conversationId}
            conversation={activeConversation}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted">
            Select a conversation to start chatting.
          </div>
        )}
      </section>
    </div>
  );
}
