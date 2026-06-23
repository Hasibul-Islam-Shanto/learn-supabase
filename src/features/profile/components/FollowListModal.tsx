import Modal from '@/shared/ui/Modal';
import UserListRow from '@/shared/components/UserListRow';
import UserListSkeleton from '@/shared/components/UserListSkeleton';
import { useFollowList, type FollowListType } from '../hooks/useFollowList';

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
          <UserListSkeleton count={5} />
        ) : error ? (
          <p className="text-sm text-muted">Couldn't load this list.</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted">{emptyMessage(type)}</p>
        ) : (
          <ul className="space-y-1">
            {users.map((user) => (
              <li key={user.id}>
                <UserListRow user={user} onClick={onClose} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
