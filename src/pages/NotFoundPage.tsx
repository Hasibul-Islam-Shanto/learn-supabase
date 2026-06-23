import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <p className="text-4xl font-bold text-brand">404</p>
      <p className="mt-2 text-brand">Page not found</p>
      <p className="mt-1 text-sm text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Go home
        </Link>
        <Link
          to="/users"
          className="inline-block rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-50"
        >
          Browse people
        </Link>
      </div>
    </div>
  );
}
