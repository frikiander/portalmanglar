import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Warning,
  Info,
  X,
  XCircle,
} from '@phosphor-icons/react';
import { useEduPlan } from '../context/EduPlanContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  onRemove: (id: string) => void;
}

const TOAST_CONFIG: Record<ToastType, {
  icon: React.ElementType;
  iconClass: string;
  barClass: string;
  bg: string;
  border: string;
}> = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
    bg: 'bg-white',
    border: 'border-emerald-200',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rose-500',
    barClass: 'bg-rose-500',
    bg: 'bg-white',
    border: 'border-rose-200',
  },
  warning: {
    icon: Warning,
    iconClass: 'text-amber-500',
    barClass: 'bg-amber-400',
    bg: 'bg-white',
    border: 'border-amber-200',
  },
  info: {
    icon: Info,
    iconClass: 'text-indigo-500',
    barClass: 'bg-indigo-500',
    bg: 'bg-white',
    border: 'border-indigo-200',
  },
};

const DURATION = 4000;

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onRemove }) => {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(100);
  const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;
  const Icon   = config.icon;

  // Entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = 50; // ms
    const step = (100 / DURATION) * interval;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p - step;
        if (next <= 0) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
        ${config.bg} ${config.border} border rounded-xl shadow-lg shadow-slate-200/60
        px-4 py-3 overflow-hidden
        transition-all duration-300 ease-out
        ${visible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : 'opacity-0 translate-x-6 translate-y-2'}
      `}
    >
      {/* Left color bar */}
      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-xl ${config.barClass}`} />

      {/* Icon */}
      <Icon weight="fill" className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />

      {/* Message */}
      <p className="flex-1 text-sm text-slate-700 leading-relaxed pr-1">
        {message}
      </p>

      {/* Close */}
      <button
        onClick={handleClose}
        className="shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${config.barClass} opacity-40 transition-all duration-50`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEduPlan();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            id={t.id}
            message={t.message}
            type={t.type as ToastType}
            onRemove={removeToast}
          />
        </div>
      ))}
    </div>
  );
};
