import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    // Keep the workspace slug in a valid shape as the user types
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
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Create your workspace</h1>

        {generic && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{generic}</div>}

        <Field label="Company name" name="company_name" value={form.company_name}
               onChange={onChange} required autoFocus error={f.company_name} />
        <Field label="Workspace domain" name="domain" value={form.domain} onChange={onChange}
               placeholder="acme" required error={f.domain} />
        <Field label="Your name" name="name" value={form.name} onChange={onChange}
               required error={f.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange}
               autoComplete="username" required error={f.email} />
        <Field label="Password" name="password" type="password" value={form.password}
               onChange={onChange} autoComplete="new-password" required error={f.password} />
        <Field label="Confirm password" name="password_confirmation" type="password"
               value={form.password_confirmation} onChange={onChange}
               autoComplete="new-password" required />

        <button type="submit" disabled={isLoading}
                className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {isLoading ? 'Creating…' : 'Create workspace'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have a workspace? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}