import type { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import { LogoMark } from './Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 transition-colors dark:bg-slate-950">
      {/* decorative background blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-500/20" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <main className="relative grid min-h-screen place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <LogoMark className="mb-4 h-12 w-12 drop-shadow-lg" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
            {children}
          </div>

          {footer && (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}