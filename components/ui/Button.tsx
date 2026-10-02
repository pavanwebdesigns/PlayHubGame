import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const variants = {
  play: 'bg-play text-night hover:brightness-110',
  secondary: 'bg-raised text-ink hover:brightness-110',
  ghost: 'bg-transparent text-ink hover:bg-raised',
} as const;

const sizes = {
  md: 'min-h-tap px-4 text-base',
  lg: 'min-h-tap-lg px-5 text-lead',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(
  variant: ButtonVariant = 'play',
  size: ButtonSize = 'md',
): string {
  return `press relative inline-flex items-center justify-center gap-2 rounded-button font-medium disabled:opacity-50 ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'play',
      size = 'md',
      icon: Icon,
      loading = false,
      className,
      children,
      disabled,
      type,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={`${buttonClass(variant, size)}${className ? ` ${className}` : ''}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
        aria-label={
          loading && typeof children === 'string'
            ? children
            : props['aria-label']
        }
      >
        <span
          className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}
        >
          {Icon ? <Icon aria-hidden="true" size={20} /> : null}
          {children}
        </span>
        {loading ? (
          <span className="spinner absolute" aria-hidden="true" />
        ) : null}
      </button>
    );
  },
);
