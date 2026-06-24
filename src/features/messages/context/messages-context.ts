import { createContext, useContext } from 'react';
import type { Conversation } from '@/shared/types';

export interface MessagesContextValue {
  conversations: Conversation[];
  loading: boolean;
  unreadTotal: number;
  refetch: () => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
}

export const MessagesContext = createContext<MessagesContextValue>({
  conversations: [],
  loading: false,
  unreadTotal: 0,
  refetch: async () => {},
  markRead: async () => {},
  setActiveConversation: () => {},
});

export const useMessagesContext = () => useContext(MessagesContext);
