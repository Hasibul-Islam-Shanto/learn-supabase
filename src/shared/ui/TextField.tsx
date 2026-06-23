import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export default function TextField({
  label,
  icon,
  className = '',
  ...props
}: TextFieldProps) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-brand"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border border-line bg-canvas py-2.5 text-sm text-brand placeholder:text-muted focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 ${
            icon ? 'pl-10 pr-4' : 'px-4'
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
