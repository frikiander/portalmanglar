import React from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'attention';

const TONES: Record<BadgeTone, string> = {
  neutral:   'bg-slate-100 text-slate-700',
  primary:   'bg-primary-50 text-primary-800',
  success:   'bg-success-50 text-success-800',
  warning:   'bg-warning-50 text-warning-800',
  danger:    'bg-danger-50 text-danger-800',
  info:      'bg-info-50 text-info-800',
  attention: 'bg-attention-400 text-raiz',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Short status or category marker. Sentence case, no icons unless they add meaning. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className, ...rest }) => (
  <span
    className={cn('inline-flex items-center gap-1 h-5 px-2 rounded-sm text-xs font-bold whitespace-nowrap', TONES[tone], className)}
    {...rest}
  />
);
