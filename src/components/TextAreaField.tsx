import type { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function TextAreaField({ label, error, id, className, ...props }: TextAreaFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={4}
        aria-invalid={!!error}
        {...props}
        className={`w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? 'border-red-500 focus:ring-red-500/15'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15 dark:border-slate-700 dark:focus:border-indigo-400'
        } ${className ?? ''}`}
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}