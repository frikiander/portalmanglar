import React from 'react';
import { cn } from './cn';

export interface TabOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ElementType;
}

export interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Vista del calendario". */
  label: string;
  className?: string;
}

/** Segmented control for switching views of the same content. Arrow keys move between options. */
export function Tabs<T extends string>({ options, value, onChange, label, className }: TabsProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    const buttons = (e.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? []) as NodeListOf<HTMLElement>;
    buttons[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex p-0.5 gap-0.5 rounded-md bg-slate-100', className)}>
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-[5px] text-sm font-bold transition-colors cursor-pointer',
              selected ? 'bg-white text-raiz shadow-sm' : 'text-slate-600 hover:text-raiz',
            )}
          >
            {Icon && <Icon className="w-4 h-4" aria-hidden />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
