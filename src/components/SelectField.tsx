import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export default function SelectField({
  label,
  error,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <select
        id={inputId}
        aria-invalid={!!error}
        {...props}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-4 [color-scheme:light] dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100 ${
          error
            ? "border-red-500 focus:ring-red-500/15"
            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15 dark:border-slate-700 dark:focus:border-indigo-400"
        } ${className ?? ""}`}
      >
        {children}
      </select>
      {error && (
        <p
          role="alert"
          className="mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
