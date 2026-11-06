import { useState, type InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"
         aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

export default function Field({ label, error, id, type, className, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={inputId}
             className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={!!error}
          {...props}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            isPassword ? 'pr-11' : ''
          } ${
            error
              ? 'border-red-500 focus:ring-red-500/15'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15 dark:border-slate-700 dark:focus:border-indigo-400'
          } ${className ?? ''}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:text-indigo-500 dark:hover:text-slate-200"
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}