import React, { useState } from 'react';
import { signInWithGoogle, SUPABASE_CONFIGURED } from '../lib/supabase';
import { ManglarEmblem } from './ManglarLogo';
import { MOCK_USERS } from '../data/mockData';
import type { User } from '../types';

// The two demo accounts offered on the login screen
const DEMO_TEACHER     = MOCK_USERS.find((u) => u.role === 'teacher')!;
const DEMO_COORDINATOR = MOCK_USERS.find((u) => u.role === 'coordinator')!;

interface LoginPageProps {
  /** Called when the user chooses a demo account (no real auth needed). */
  onDemoLogin: (user: User) => void;
  /** Optional error message passed down (e.g. "email not authorized"). */
  authError?: string | null;
  isLoading?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onDemoLogin, authError, isLoading }) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!SUPABASE_CONFIGURED) {
      setLocalError(
        'Supabase aún no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local para usar el inicio de sesión con Google.'
      );
      return;
    }
    try {
      setGoogleLoading(true);
      setLocalError(null);
      await signInWithGoogle();
      // After this, Supabase redirects to Google and back — no further action needed here.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión con Google.';
      setLocalError(msg);
      setGoogleLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">

      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-100/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* ─── Logo & Brand ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
            <ManglarEmblem className="w-10 h-10" withShadow={false} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal <span className="text-indigo-600">Manglar</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Colegio Integral El Manglar</p>
          </div>
        </div>

        {/* ─── Card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accede con tu cuenta institucional de Google
            </p>
          </div>

          {/* Error banner */}
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
              {displayError}
            </div>
          )}

          {/* Google Sign-In button */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200
                       bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm
                       shadow-sm hover:shadow transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Google logo SVG */}
            {googleLoading || isLoading ? (
              <svg className="w-5 h-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>
              {googleLoading || isLoading ? 'Conectando…' : 'Continuar con Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">o accede en modo demo</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Demo accounts */}
          <div className="space-y-2.5">
            <DemoUserButton
              user={DEMO_TEACHER}
              label="Demo Docente"
              sublabel={DEMO_TEACHER.specialty || 'Rol: Docente'}
              badgeColor="bg-emerald-100 text-emerald-700"
              onClick={() => onDemoLogin(DEMO_TEACHER)}
            />
            <DemoUserButton
              user={DEMO_COORDINATOR}
              label="Demo Coordinador"
              sublabel={DEMO_COORDINATOR.specialty || 'Rol: Coordinador'}
              badgeColor="bg-indigo-100 text-indigo-700"
              onClick={() => onDemoLogin(DEMO_COORDINATOR)}
            />
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
            Los accesos con Google están restringidos a correos autorizados por Coordinación.
            El modo demo es solo para exploración.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Colegio Integral El Manglar · Portal de Gestión Académica
        </p>
      </div>
    </div>
  );
};

// ─── Sub-component: Demo user button ──────────────────────────────────────────
interface DemoUserButtonProps {
  user: User;
  label: string;
  sublabel: string;
  badgeColor: string;
  onClick: () => void;
}

const DemoUserButton: React.FC<DemoUserButtonProps> = ({
  user,
  label,
  sublabel,
  badgeColor,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200
               hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-150 text-left group"
  >
    <img
      src={user.avatar}
      alt={user.fullName}
      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
        {user.fullName}
      </p>
      <p className="text-xs text-slate-400 truncate">{sublabel}</p>
    </div>
    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
      {label}
    </span>
  </button>
);
