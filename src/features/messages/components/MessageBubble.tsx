import type { Message } from '@/shared/types';
import { formatDate } from '@/shared/lib/date-format';

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
}

export default function MessageBubble({ message, mine }: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            mine
              ? 'rounded-br-md bg-accent text-white'
              : 'rounded-bl-md bg-canvas text-brand-900'
          }`}
        >
          {message.content}
        </div>
        <p
          className={`mt-1 text-[11px] text-muted ${
            mine ? 'text-right' : 'text-left'
          }`}
        >
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}
