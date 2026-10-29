import React from 'react';
import { cn } from './cn';

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Controls aligned to the right of the title. */
  actions?: React.ReactNode;
  /** Remove body padding, e.g. for tables and row lists that run edge to edge. */
  flush?: boolean;
}

/** Resting surface for a group of content: 1px border, no shadow. */
export const Panel: React.FC<PanelProps> = ({ title, description, actions, flush, className, children, ...rest }) => (
  <section className={cn('bg-white border border-slate-200 rounded-xl', className)} {...rest}>
    {(title || actions) && (
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          {title && <h2 className="text-base font-bold text-raiz">{title}</h2>}
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}
    <div className={flush ? undefined : 'p-5'}>{children}</div>
  </section>
);
