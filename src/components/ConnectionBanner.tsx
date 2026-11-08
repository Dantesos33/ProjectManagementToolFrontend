import { useAppSelector } from '../hooks/index';

export default function ConnectionBanner() {
  const status = useAppSelector((s) => s.ui.realtime);
  if (status !== 'reconnecting' && status !== 'error') return null;

  return (
    <div role="status"
         className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      {status === 'error'
        ? 'Live updates are unavailable. Reload the page to try again.'
        : 'Live updates disconnected. Reconnecting…'}
    </div>
  );
}