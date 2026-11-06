import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import Field from '../../components/Field';
import { useAppDispatch } from '../../hooks/index';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { useRegisterMutation, type RegisterBody } from '../../store/auth/authApi';
import { setCredentials } from '../../store/auth/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState<RegisterBody>({
    company_name: '', domain: '', name: '', email: '',
    password: '', password_confirmation: '',
  });
  const [error, setError] = useState<ParsedError | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = name === 'domain' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '') : value;
    setForm((f) => ({ ...f, [name]: next }));
  };

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = await register(form).unwrap();
      dispatch(setCredentials(payload));
      navigate('/', { replace: true });
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  const f = error?.fields ?? {};
  const generic = error && Object.keys(f).length === 0 ? error.message : null;

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Set up DeesOps for your team in under a minute."
      footer={
        <>
          Already have a workspace?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {generic && (
          <div role="alert"
               className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {generic}
          </div>
        )}

        <Field label="Company name" name="company_name" value={form.company_name}
               onChange={onChange} placeholder="Acme Inc" required autoFocus error={f.company_name} />
        <Field label="Workspace domain" name="domain" value={form.domain} onChange={onChange}
               placeholder="acme" required error={f.domain} />
        <Field label="Your name" name="name" value={form.name} onChange={onChange}
               placeholder="Jane Doe" required error={f.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange}
               placeholder="jane@acme.com" autoComplete="username" required error={f.email} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" name="password" type="password" value={form.password}
                 onChange={onChange} autoComplete="new-password" required error={f.password} />
          <Field label="Confirm password" name="password_confirmation" type="password"
                 value={form.password_confirmation} onChange={onChange}
                 autoComplete="new-password" required />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating…' : 'Create workspace'}
        </button>
      </form>
    </AuthLayout>
  );
}