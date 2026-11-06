import { Link } from 'react-router-dom';

interface PlaceholderProps { title: string; description: string; showHome?: boolean }

export default function Placeholder({ title, description, showHome }: PlaceholderProps) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {showHome && (
        <Link to="/" className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Back to dashboard
        </Link>
      )}
    </div>
  );
}