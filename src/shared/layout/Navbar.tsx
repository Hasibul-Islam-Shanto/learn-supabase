import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@/shared/ui/IconButton';
import Button from '@/shared/ui/Button';
import { MessageIcon, SearchIcon } from '@/shared/ui/icons';
import { useAuth } from '@/features/auth/context/auth-context';
import GlobalSearch from '@/features/search/components/GlobalSearch';
import NotificationsMenu from '@/features/notifications/components/NotificationsMenu';
import UserMenu from './UserMenu';

export default function Navbar() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();

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

        {session && <GlobalSearch />}

        <div className="ml-auto flex items-center gap-1">
          {session ? (
            <>
              <IconButton
                label="Search"
                className="bg-canvas sm:hidden"
                onClick={() => navigate('/search')}
              >
                <SearchIcon />
              </IconButton>
              <IconButton label="Messages" className="bg-canvas">
                <MessageIcon />
              </IconButton>
              <NotificationsMenu />
              <UserMenu profile={profile} user={session.user} />
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
