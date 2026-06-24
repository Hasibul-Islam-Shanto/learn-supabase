import { useState } from 'react';
import { SendIcon } from '@/shared/ui/icons';

interface MessageComposerProps {
  onSend: (content: string) => Promise<boolean>;
}

export default function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    const ok = await onSend(content);
    if (ok) setText('');
    setSending(false);
  };

  return (
    <div className="flex items-center gap-2 border-t border-line p-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Write a message…"
        disabled={sending}
        className="w-full rounded-full bg-canvas py-2.5 pl-4 pr-4 text-sm text-brand placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim() || sending}
        aria-label="Send message"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50"
      >
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <SendIcon size={18} />
        )}
      </button>
    </div>
  );
}
