import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'brand' | 'accent' | 'ghost' | 'outline';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  brand: 'bg-brand text-white hover:bg-brand-700',
  accent: 'bg-accent text-white hover:bg-accent-600',
  ghost: 'text-brand hover:bg-brand-50',
  outline: 'border border-line text-brand hover:bg-brand-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export default function Button({
  variant = 'brand',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
