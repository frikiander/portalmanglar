import React, { useState } from 'react';
import { signInWithGoogle, SUPABASE_CONFIGURED } from '../lib/supabase';
import { ManglarEmblem } from './ManglarLogo';
import { MOCK_USERS } from '../data/mockData';
import { Badge } from './ui';
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
      console.warn('[Supabase] Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local para activar Google.');
      setLocalError(
        'El inicio con Google aún no está activado en este portal. Entra con una cuenta de demostración o pide a Coordinación que lo active.'
      );
      return;
    }
    try {
      setGoogleLoading(true);
      setLocalError(null);
      await signInWithGoogle();
      // After this, Supabase redirects to Google and back — no further action needed here.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
      setLocalError(msg);
      setGoogleLoading(false);
    }
  };

  const displayError = localError || authError;
  const busy = googleLoading || isLoading;

  return (
    <div className="min-h-screen bg-fango lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">

      {/* ─── Brand panel: the emblem needs the dark ground for its white triangle ─── */}
      <aside className="relative overflow-hidden bg-raiz text-white px-6 py-6 sm:px-10 lg:px-14 lg:py-12 flex flex-col">
        <div className="flex items-center gap-3">
          <ManglarEmblem className="w-10 h-10 shrink-0" withShadow={false} />
          <div className="leading-tight">
            <p className="font-extrabold text-base tracking-tight">Portal Manglar</p>
            <p className="text-xs text-white/60">Colegio Integral El Manglar</p>
          </div>
        </div>

        <div className="hidden lg:block relative z-10 mt-[12vh] mb-auto">
          <p className="max-w-[15ch] text-3xl xl:text-[2.75rem] font-extrabold tracking-tight leading-[1.08]">
            Planifica, evalúa y organiza el año escolar desde un solo lugar.
          </p>
        </div>

        <p className="hidden lg:block relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Colegio Integral El Manglar
        </p>

        {/* Oversized emblem bleeding off the corner */}
        <ManglarEmblem
          className="hidden lg:block absolute -right-24 -bottom-16 w-[34rem] h-auto opacity-90 pointer-events-none"
          withShadow={false}
        />
      </aside>

      {/* ─── Sign-in ─── */}
      <main className="flex items-center justify-center px-6 py-10 sm:px-10 lg:py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-raiz">Entrar al portal</h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Usa tu cuenta institucional de Google.
          </p>

          {displayError && (
            <div role="alert" className="mt-5 p-3 rounded-md bg-danger-50 border border-danger-200 text-sm text-danger-800">
              {displayError}
            </div>
          )}

          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={busy}
            className="mt-6 w-full h-11 flex items-center justify-center gap-3 px-4 rounded-md border border-slate-300
                       bg-white hover:bg-slate-50 hover:border-slate-400 text-raiz font-bold text-sm
                       transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? (
              <svg className="w-5 h-5 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{busy ? 'Conectando…' : 'Continuar con Google'}</span>
          </button>

          <p className="text-xs text-slate-500 mt-3">
            Solo pueden entrar los correos que Coordinación haya autorizado.
          </p>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-sm font-bold text-raiz">Explorar sin cuenta</h2>
            <p className="text-xs text-slate-500 mt-1">Cuentas con datos de ejemplo para conocer el portal.</p>

            <div className="mt-3 space-y-2">
              <DemoUserButton
                user={DEMO_TEACHER}
                role="Docente"
                sublabel={DEMO_TEACHER.specialty || 'Docente de aula'}
                onClick={() => onDemoLogin(DEMO_TEACHER)}
              />
              <DemoUserButton
                user={DEMO_COORDINATOR}
                role="Coordinación"
                sublabel={DEMO_COORDINATOR.specialty || 'Coordinación académica'}
                onClick={() => onDemoLogin(DEMO_COORDINATOR)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── Sub-component: Demo user button ──────────────────────────────────────────
interface DemoUserButtonProps {
  user: User;
  role: string;
  sublabel: string;
  onClick: () => void;
}

const DemoUserButton: React.FC<DemoUserButtonProps> = ({ user, role, sublabel, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-slate-200 bg-white
               hover:border-primary-600 transition-colors text-left cursor-pointer"
  >
    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-bold text-raiz truncate">{user.fullName}</span>
      <span className="block text-xs text-slate-500 truncate">{sublabel}</span>
    </span>
    <Badge tone="neutral">{role}</Badge>
  </button>
);
