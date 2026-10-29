import React from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon component rendered before the label. */
  icon?: React.ElementType;
}

// One primary action per view; secondary for alternatives; ghost for low-weight actions.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'bg-white text-raiz border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
  ghost:     'text-slate-700 hover:bg-slate-100 hover:text-raiz',
  danger:    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon: Icon, className, children, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-md font-bold transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} weight="bold" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
