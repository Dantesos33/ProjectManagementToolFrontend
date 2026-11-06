import { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppLogout } from '../../hooks/index';
import { Icon } from './Icons';

const ROLE_STYLES = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  developer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
} as const;

export default function UserMenu() {
  const user = useAppSelector((s) => s.auth.user);
  const { logout, isLoading } = useAppLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 py-1 pl-1 pr-3 transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
          {user.name}
        </span>
        <Icon name="chevron" className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
        >
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[user.role]}`}>
              {user.role}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={isLoading}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name="logout" className="h-4 w-4" />
            {isLoading ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  );
}