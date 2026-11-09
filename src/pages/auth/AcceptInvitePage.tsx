import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import Field from '../../components/Field';
import { useAppDispatch } from '../../hooks';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { baseApi } from '../../store/api/baseApi';
import { useAcceptInviteMutation, usePreviewInvitationQuery } from '../../store/auth/authApi';
import { setCredentials } from '../../store/auth/authSlice';

export default function AcceptInvitePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Keep the token in memory, then remove it from the address bar and browser history
  const [token] = useState(() => params.get('token') ?? '');
  useEffect(() => {
    if (params.get('token')) navigate('/accept-invite', { replace: true });
  }, [params, navigate]);

  const { data: invite, isLoading, isError } = usePreviewInvitationQuery(token, { skip: !token });
  const [acceptInvite, { isLoading: submitting }] = useAcceptInviteMutation();

  const [form, setForm] = useState({ name: '', password: '', password_confirmation: '' });
  const [error, setError] = useState<ParsedError | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = await acceptInvite({ token, ...form }).unwrap();
      dispatch(baseApi.util.resetApiState());   // drop anything cached for a previous user in this tab
      dispatch(setCredentials(payload));
      navigate('/', { replace: true });
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  if (!token || isError) {
    return (
      <AuthLayout title="Invitation not valid" subtitle="This link is invalid, already used, or has expired."
                  footer={<Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Go to sign in</Link>}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Ask the person who invited you to send a new invitation.
        </p>
      </AuthLayout>
    );
  }

  if (isLoading || !invite) {
    return (
      <AuthLayout title="Checking invitation…" subtitle="One moment.">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" aria-busy="true" />
      </AuthLayout>
    );
  }

  const f = error?.fields ?? {};
  const banner = f.token ?? (error && Object.keys(f).length === 0 ? error.message : null);

  return (
    <AuthLayout
      title={`Join ${invite.company}`}
      subtitle={`You've been invited as ${invite.role}. Choose your name and password.`}
      footer={<>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {banner && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {banner}
          </div>
        )}

        <Field label="Email" name="email" type="email" value={invite.email} readOnly />
        <Field label="Your name" name="name" value={form.name} onChange={onChange} required autoFocus error={f.name} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange}
               autoComplete="new-password" required error={f.password} />
        <Field label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation}
               onChange={onChange} autoComplete="new-password" required />

        <button type="submit" disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Joining…' : 'Join workspace'}
        </button>
      </form>
    </AuthLayout>
  );
}