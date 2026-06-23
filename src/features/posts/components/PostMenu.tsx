import { useEffect, useRef, useState } from 'react';
import { EditIcon, MoreIcon, TrashIcon } from '@/shared/ui/icons';

interface PostMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function PostMenu({ onEdit, onDelete }: PostMenuProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-brand-50"
      >
        <MoreIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-50"
          >
            <EditIcon /> Edit post
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-50"
          >
            <TrashIcon /> Delete post
          </button>
        </div>
      )}
    </div>
  );
}
