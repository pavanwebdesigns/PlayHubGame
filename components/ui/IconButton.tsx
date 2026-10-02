import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: LucideIcon;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, icon: Icon, className, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        aria-label={label}
        title={label}
        className={`press group relative inline-flex h-tap w-tap items-center justify-center rounded-button text-ink hover:bg-raised disabled:opacity-50${className ? ` ${className}` : ''}`}
        {...props}
      >
        <Icon aria-hidden="true" size={20} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-full z-nav mt-1 hidden rounded-input bg-raised px-2 py-1 text-ui text-ink lg:group-focus-visible:block lg:group-hover:block"
        >
          {label}
        </span>
      </button>
    );
  },
);
