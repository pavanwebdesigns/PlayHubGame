import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, className, type, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={selected}
      className={`press inline-flex min-h-tap items-center rounded-button border border-edge px-4 text-ink ${selected ? 'bg-play text-night' : 'bg-deck'}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </button>
  );
});
