import Avatar from '@/shared/ui/Avatar';
import { useAuth } from '@/features/auth/context/auth-context';
import { fallbackAvatar } from '@/features/profile/helpers';

interface CreatePostBoxProps {
  onOpen: () => void;
}

export default function CreatePostBox({ onOpen }: CreatePostBoxProps) {
  const { profile } = useAuth();
  const displayName = profile?.full_name ?? profile?.username ?? 'there';
  const avatarSrc = profile?.avatar_url ?? fallbackAvatar(displayName);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={avatarSrc} alt={displayName} size={44} />
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-full bg-canvas px-4 py-3 text-left text-sm text-muted transition-colors hover:bg-brand-50"
        >
          What's on your mind, {displayName.split(' ')[0]}?
        </button>
      </div>
    </div>
  );
}
