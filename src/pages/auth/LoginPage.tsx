import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Field from '../../components/Field';
import { useAppDispatch } from '../../hooks/index';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { useLoginMutation, type LoginBody } from '../../store/auth/authApi';
import { setCredentials } from '../../store/auth/authSlice';
import AuthLayout from '../../components/AuthLayout';

const LAST_DOMAIN_KEY = 'last_workspace';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState<LoginBody>({
    domain: localStorage.getItem(LAST_DOMAIN_KEY) ?? '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<ParsedError | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = await login(form).unwrap();
      localStorage.setItem(LAST_DOMAIN_KEY, form.domain.trim().toLowerCase());
      dispatch(setCredentials(payload));
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  const banner = error && (error.fields.email ?? (Object.keys(error.fields).length ? '' : error.message));

  return (
  <AuthLayout
    title="Welcome back"
    subtitle="Sign in to your DeesOps workspace."
    footer={
      <>
        New company?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Create a workspace
        </Link>
      </>
    }
  >
    <form onSubmit={onSubmit} className="space-y-4">
      {banner && (
        <div role="alert"
             className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {banner}
        </div>
      )}

      <Field label="Workspace" name="domain" value={form.domain} onChange={onChange}
             placeholder="acme" required autoFocus error={error?.fields.domain} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={onChange}
             autoComplete="username" required />
      <Field label="Password" name="password" type="password" value={form.password}
             onChange={onChange} autoComplete="current-password" required
             error={error?.fields.password} />

      <button type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60">
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  </AuthLayout>
);
}