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
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          {...props}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 ${
            isPassword ? 'pr-10' : ''
          } ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          } ${className ?? ''}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-500 hover:text-gray-700"
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}