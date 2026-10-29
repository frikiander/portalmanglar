import React, { useId } from 'react';
import { cn } from './cn';

/** Shared look for text inputs, selects and textareas. */
export const controlClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-raiz placeholder:text-slate-500 ' +
  'transition-colors hover:border-slate-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

export interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  /** Receives the generated id so the control can be linked to its label. */
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, required, className, children }) => {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-danger-600" aria-hidden> *</span>}
      </label>
      {children(id, note ? noteId : undefined)}
      {note && (
        <p id={noteId} className={cn('text-xs', error ? 'text-danger-700' : 'text-slate-500')}>
          {note}
        </p>
      )}
    </div>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cn(controlClass, 'h-10', className)} {...rest} />,
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...rest }, ref) => <select ref={ref} className={cn(controlClass, 'h-10 pr-8', className)} {...rest} />,
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => <textarea ref={ref} className={cn(controlClass, 'py-2 min-h-24', className)} {...rest} />,
);
Textarea.displayName = 'Textarea';
