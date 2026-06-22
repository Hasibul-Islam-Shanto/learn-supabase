import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { PlusIcon } from '../ui/icons';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="h-20 w-full">
        <img src={user.cover} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-8 flex items-end justify-between">
          <Avatar src={user.avatar} alt={user.name} size={64} ring />
          <span className="text-xs text-muted">
            {user.followers.toLocaleString()} followers
          </span>
        </div>

        <Link
          to={`/profile/${user.id}`}
          className="mt-2 block font-semibold text-brand hover:underline"
        >
          {user.name}
        </Link>
        <p className="text-xs text-muted">@{user.username}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{user.bio}</p>

        <div className="mt-4 flex gap-2">
          <Button
            variant={following ? 'outline' : 'accent'}
            size="sm"
            fullWidth
            onClick={() => setFollowing((v) => !v)}
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
