import { useAuth } from '@/features/auth/context/auth-context';
import { useFollowList } from '@/features/profile/hooks/useFollowList';
import UserListRow from '@/shared/components/UserListRow';
import UserListSkeleton from '@/shared/components/UserListSkeleton';

export default function RightRail() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const {
    users: followers,
    loading,
    error,
  } = useFollowList(userId, 'followers', Boolean(userId), 8);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Your followers
          </h3>

          {loading ? (
            <UserListSkeleton count={5} avatarSize={36} />
          ) : error ? (
            <p className="text-sm text-muted">Couldn't load followers.</p>
          ) : followers.length === 0 ? (
            <p className="text-sm text-muted">No followers yet.</p>
          ) : (
            <ul className="space-y-1">
              {followers.map((follower) => (
                <li key={follower.id}>
                  <UserListRow user={follower} avatarSize={36} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
