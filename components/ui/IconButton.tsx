import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, icon, className, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        aria-label={label}
        title={label}
        className={`press group relative inline-flex h-tap w-tap items-center justify-center rounded-button text-ink hover:bg-raised disabled:opacity-50${className ? ` ${className}` : ''}`}
        {...props}
      >
        {icon}
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
