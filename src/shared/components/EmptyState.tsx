import type { ReactNode } from 'react';

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

export default function EmptyState({
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-10 text-center text-muted shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
