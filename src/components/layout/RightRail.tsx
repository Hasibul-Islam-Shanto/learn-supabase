import Avatar from '../ui/Avatar';
import { users } from '../../data/mock';

export default function RightRail() {
  const activeFriends = users.slice(2, 8);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
            Active friends
          </h3>
          <ul className="space-y-2.5">
            {activeFriends.map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <Avatar src={user.avatar} alt={user.name} size={36} online />
                <p className="truncate text-sm font-medium text-brand">
                  {user.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
