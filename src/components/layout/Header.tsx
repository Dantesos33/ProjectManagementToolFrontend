import { useAppDispatch } from '../../hooks/index';
import { openSidebar } from '../../store/theme/uiSlice';
import ThemeToggle from '../ThemeToggle';
import { Icon } from './Icons';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';

export default function Header() {
  const dispatch = useAppDispatch();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        type="button"
        onClick={() => dispatch(openSidebar())}
        aria-label="Open menu"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <Icon name="menu" />
      </button>

      {/* spacer: on desktop this is where a page title or search will go */}
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}