import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export default function IconButton({
  children,
  label,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
