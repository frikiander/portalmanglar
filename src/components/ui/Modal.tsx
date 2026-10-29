import React, { useEffect, useId, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from './cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export interface ModalProps {
  open?: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Context line under the title (which school, which student…). */
  subtitle?: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Dialog with scrim, Escape to close and focus moved inside on open. */
export const Modal: React.FC<ModalProps> = ({
  open = true, onClose, title, subtitle, size = 'md', footer, className, children,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Parents usually pass a new onClose each render; keep the latest without re-running the focus effect.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-raiz/40" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative w-full my-6 flex flex-col max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden focus:outline-none',
          SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-raiz leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-md text-slate-500 hover:text-raiz hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
