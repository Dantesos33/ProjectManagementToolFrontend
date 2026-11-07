import { useId } from 'react';

interface LogoProps {
  /** Show the "DeesOps" wordmark next to the mark */
  showText?: boolean;
  /** Tailwind size classes for the mark, e.g. "h-9 w-9" */
  className?: string;
}

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  // Unique gradient id, so several logos on one page don't clash
  const gradientId = useId();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"
         className={className} role="img" aria-label="DeesOps">
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`} />
      <path d="M17 14h7a10 10 0 0 1 0 20h-7z" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M20.5 24.5l3 3 5.5-6" stroke="#fff" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ showText = true, className }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark className={className} />
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Dees<span className="text-indigo-600 dark:text-indigo-400">Ops</span>
        </span>
      )}
    </span>
  );
}
