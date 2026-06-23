import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import type { FollowListType } from './useFollowList';
import { useFollowList } from './useFollowList';

interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  type: FollowListType;
  displayName: string;
}

function listTitle(type: FollowListType, displayName: string): string {
  const firstName = displayName.split(' ')[0];
  return type === 'followers'
    ? `${firstName}'s followers`
    : `${firstName} is following`;
}

function emptyMessage(type: FollowListType): string {
  return type === 'followers'
    ? 'No followers yet.'
    : 'Not following anyone yet.';
}

export default function FollowListModal({
  open,
  onClose,
  profileId,
  type,
  displayName,
}: FollowListModalProps) {
  const { users, loading, error } = useFollowList(profileId, type, open);

  return (
    <Modal open={open} onClose={onClose} title={listTitle(type, displayName)}>
      <div className="max-h-[min(60vh,420px)] overflow-y-auto -mx-1 px-1">
        {loading ? (
          <ul className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={`skeleton-${i}`} className="flex items-center gap-3">
                <span className="h-10 w-10 animate-pulse rounded-full bg-canvas" />
                <span className="h-3 w-32 animate-pulse rounded bg-canvas" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="text-sm text-muted">Couldn't load this list.</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted">{emptyMessage(type)}</p>
        ) : (
          <ul className="space-y-1">
            {users.map((user) => {
              const name = user.full_name ?? user.username ?? 'User';
              return (
                <li key={user.id}>
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50"
                  >
                    <Avatar
                      src={user.avatar_url}
                      name={name}
                      alt={name}
                      size={40}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand">
                        {name}
                      </p>
                      {user.username && (
                        <p className="truncate text-xs text-muted">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
