import { useState, type SubmitEvent } from 'react';
import Field from './Field';
import Modal from './Modal';
import SelectField from './SelectField';
import { parseApiError, type ParsedError } from '../lib/errors';
import { useCreateInvitationMutation } from '../store/team/teamApi';
import type { Role } from '../types';
import { ROLES } from '../constants/roles';

interface InviteFormModalProps { open: boolean; onClose: () => void }

export default function InviteFormModal({ open, onClose }: InviteFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Invite a team member">
      <InviteForm onClose={onClose} />
    </Modal>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [createInvitation, { isLoading }] = useCreateInvitationMutation();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('developer');   // lowest role that is useful, so higher ones are a conscious choice
  const [error, setError] = useState<ParsedError | null>(null);
  const [sent, setSent] = useState<{ email: string; link?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const invitation = await createInvitation({ email: email.trim(), role }).unwrap();
      setSent({ email: invitation.email, link: invitation.link });
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the link is still selectable in the box */ }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Invitation sent to <span className="font-medium text-slate-900 dark:text-white">{sent.email}</span>.
          The link works for 7 days.
        </p>

        {sent.link && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Development only: copy the link instead of reading the mail log
            </p>
            <div className="flex gap-2">
              <input readOnly value={sent.link} onFocus={(e) => e.target.select()}
                     className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" />
              <button type="button" onClick={() => copy(sent.link!)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => { setSent(null); setEmail(''); }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Invite another
          </button>
          <button type="button" onClick={onClose}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Done
          </button>
        </div>
      </div>
    );
  }

  const f = error?.fields ?? {};
  const generic = error && Object.keys(f).length === 0 ? error.message : null;
  const description = ROLES.find((r) => r.value === role)?.description;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {generic && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {generic}
        </div>
      )}

      <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
             placeholder="teammate@company.com" required autoFocus error={f.email} />

      <div>
        <SelectField label="Role" name="role" value={role} onChange={(e) => setRole(e.target.value as Role)} error={f.role}>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </SelectField>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        {role === 'admin' && (
          <p role="note" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Admins can invite and remove people and read the audit log. Only choose this for people you fully trust.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? 'Sending…' : 'Send invitation'}
        </button>
      </div>
    </form>
  );
}