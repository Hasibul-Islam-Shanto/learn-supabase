import { Link } from 'react-router-dom';
import IconButton from '../ui/IconButton';
import Button from '../ui/Button';
import { BellIcon, MessageIcon, SearchIcon } from '../ui/icons';
import { useAuth } from '../../context/auth-context';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 0 20V2Z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand">
            Meet<span className="text-accent">.</span>
          </span>
        </Link>

        <div className="relative mx-2 hidden max-w-md flex-1 sm:block">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Search for friends, groups, pages"
            className="w-full rounded-full border border-transparent bg-canvas py-2.5 pl-10 pr-4 text-sm text-brand placeholder:text-muted focus:border-brand-200 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {session ? (
            <>
              <IconButton label="Messages" className="bg-canvas">
                <MessageIcon />
              </IconButton>
              <IconButton label="Notifications" className="bg-canvas">
                <BellIcon />
              </IconButton>
              <UserMenu user={session.user} />
            </>
          ) : (
            <Link to="/signin">
              <Button variant="accent" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
