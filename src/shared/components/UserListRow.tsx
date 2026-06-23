import { Link } from 'react-router-dom';
import Avatar from '@/shared/ui/Avatar';

interface UserListRowUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio?: string | null;
}

interface UserListRowProps {
  user: UserListRowUser;
  onClick?: () => void;
  avatarSize?: number;
  showBio?: boolean;
  bold?: boolean;
  className?: string;
}

export default function UserListRow({
  user,
  onClick,
  avatarSize = 40,
  showBio = false,
  bold = false,
  className = 'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50',
}: UserListRowProps) {
  const name = user.full_name ?? user.username ?? 'User';

  return (
    <Link to={`/profile/${user.id}`} onClick={onClick} className={className}>
      <Avatar src={user.avatar_url} name={name} alt={name} size={avatarSize} />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${bold ? 'font-semibold' : 'font-medium'} text-brand`}
        >
          {name}
        </p>
        {user.username && (
          <p className="truncate text-xs text-muted">@{user.username}</p>
        )}
        {showBio && user.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}
