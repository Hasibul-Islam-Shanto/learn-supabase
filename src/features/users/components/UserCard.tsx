import { Link } from 'react-router-dom';
import type { DiscoverUser } from '@/shared/types';
import Avatar from '@/shared/ui/Avatar';
import Button from '@/shared/ui/Button';
import { PlusIcon } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/context/auth-context';
import { useToggleFollow } from '@/features/profile/hooks/useToggleFollow';

interface UserCardProps {
  user: DiscoverUser;
}

export default function UserCard({ user }: UserCardProps) {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const { following, followerCount, pending, toggle } = useToggleFollow({
    targetUserId: user.id,
    currentUserId,
    initialFollowing: user.is_following,
    initialFollowerCount: user.follower_count,
  });

  const name = user.full_name ?? user.username ?? 'User';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="h-20 w-full">
        {user.cover_url ? (
          <img
            src={user.cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-brand-100 to-accent-50" />
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-8 flex items-end justify-between">
          <Avatar src={user.avatar_url} name={name} alt={name} size={64} ring />
          <span className="text-xs text-muted">
            {followerCount.toLocaleString()}{' '}
            {followerCount === 1 ? 'follower' : 'followers'}
          </span>
        </div>

        <Link
          to={`/profile/${user.id}`}
          className="mt-2 block font-semibold text-brand hover:underline"
        >
          {name}
        </Link>
        {user.username && (
          <p className="text-xs text-muted">@{user.username}</p>
        )}
        {user.bio && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{user.bio}</p>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            variant={following ? 'outline' : 'accent'}
            size="sm"
            fullWidth
            onClick={toggle}
            disabled={pending || !currentUserId}
          >
            {!following && <PlusIcon size={16} />}
            {following ? 'Following' : 'Follow'}
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
