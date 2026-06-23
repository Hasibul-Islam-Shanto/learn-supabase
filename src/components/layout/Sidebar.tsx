import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

import {
  GroupsIcon,
  HomeIcon,
  ProfileIcon,
  SavedIcon,
  UsersIcon,
} from '../ui/icons';
import { useAuth } from '../../context/auth-context';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: <HomeIcon />, end: true },
  { to: '/users', label: 'Find followers', icon: <UsersIcon /> },
  {
    to: `/profile`,
    label: 'Profile',
    icon: <ProfileIcon />,
  },
];

const staticItems: { label: string; icon: ReactNode }[] = [
  { label: 'Groups', icon: <GroupsIcon /> },
  { label: 'Saved', icon: <SavedIcon /> },
];

export default function Sidebar() {
  const { session } = useAuth();
  const currentUser = session?.user;
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-4">
        <nav className="rounded-2xl bg-white p-2 shadow-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={
                item.to === '/profile' ? `/profile/${currentUser?.id}` : item.to
              }
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-accent'
                    : 'text-brand hover:bg-brand-50'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          {staticItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
