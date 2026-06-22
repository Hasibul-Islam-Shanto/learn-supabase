import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase';
import Avatar from '../ui/Avatar';
import { ProfileIcon } from '../ui/icons';

interface UserMenuProps {
  user: User;
}

function displayName(user: User): string {
  return (
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Account'
  );
}

function avatarUrl(user: User): string {
  const fromMeta = user.user_metadata?.avatar_url as string | undefined;
  if (fromMeta) return fromMeta;
  const name = encodeURIComponent(displayName(user));
  return `https://ui-avatars.com/api/?name=${name}&background=321847&color=fff`;
}

export default function UserMenu({ user }: UserMenuProps) {
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

  const handleLogout = async () => {
    setOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Signed out');
  };

  const name = displayName(user);

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Avatar src={avatarUrl(user)} alt={name} size={38} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar src={avatarUrl(user)} alt={name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand">
                {name}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <Link
            to={`/profile/${user.id}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-50"
          >
            <ProfileIcon size={18} /> My Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
