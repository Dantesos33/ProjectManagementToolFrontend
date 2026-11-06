import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Field from '../../components/Field';
import { useAppDispatch } from '../../hooks/index';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { useLoginMutation, type LoginBody } from '../../store/auth/authApi';
import { setCredentials } from '../../store/auth/authSlice';

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
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Sign in to {import.meta.env.VITE_APP_NAME}</h1>

        {banner && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{banner}</div>
        )}

        <Field label="Workspace" name="domain" value={form.domain} onChange={onChange}
               placeholder="acme" required autoFocus error={error?.fields.domain} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange}
               autoComplete="username" required />
        <Field label="Password" name="password" type="password" value={form.password}
               onChange={onChange} autoComplete="current-password" required
               error={error?.fields.password} />

        <button type="submit" disabled={isLoading}
                className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-gray-600">
          New company? <Link to="/register" className="text-blue-600 hover:underline">Create a workspace</Link>
        </p>
      </form>
    </div>
  );
}