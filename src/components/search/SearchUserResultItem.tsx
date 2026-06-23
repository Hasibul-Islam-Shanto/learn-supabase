import { Link } from 'react-router-dom';
import type { SearchUserResult } from '../../types';
import Avatar from '../ui/Avatar';

interface SearchUserResultItemProps {
  user: SearchUserResult;
  onSelect?: () => void;
}

export default function SearchUserResultItem({
  user,
  onSelect,
}: SearchUserResultItemProps) {
  const name = user.full_name ?? user.username ?? 'User';

  return (
    <Link
      to={`/profile/${user.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
    >
      <Avatar src={user.avatar_url} name={name} alt={name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand">{name}</p>
        {user.username && (
          <p className="truncate text-xs text-muted">@{user.username}</p>
        )}
        {user.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}
