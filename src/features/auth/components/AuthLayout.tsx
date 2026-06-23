import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-600 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" opacity="0.4" />
              <path d="M12 2a10 10 0 0 1 0 20V2Z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Meet<span className="text-accent">.</span>
          </span>
        </div>

        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-tight">
            Connect with the people who matter most.
          </h2>
          <p className="mt-4 text-white/70">
            Share moments, follow friends, and stay in the loop with a simple,
            friendly social experience.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="h-2 w-8 rounded-full bg-accent" />
          <span>Made for staying close.</span>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 0 20V2Z" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-brand">
              Meet<span className="text-accent">.</span>
            </span>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-brand">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">{footer}</p>

          <p className="mt-6 text-center text-xs text-muted">
            <Link to="/" className="hover:text-brand">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
