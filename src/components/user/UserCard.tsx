import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { DiscoverUser } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { PlusIcon } from '../ui/icons';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/auth-context';

interface UserCardProps {
  user: DiscoverUser;
}

export default function UserCard({ user }: UserCardProps) {
  const { session } = useAuth();
  const currentUserId = session?.user.id;

  const [following, setFollowing] = useState(user.is_following);
  const [followerCount, setFollowerCount] = useState(user.follower_count);
  const [pending, setPending] = useState(false);

  const name = user.full_name ?? user.username ?? 'User';

  const handleFollow = async () => {
    if (!currentUserId || pending) return;
    const next = !following;
    setFollowing(next);
    setFollowerCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setPending(true);
    const { error } = next
      ? await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: user.id })
      : await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', user.id);
    setPending(false);
    if (error) {
      setFollowing(!next);
      setFollowerCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(error.message);
    }
  };

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
            onClick={handleFollow}
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
