import { useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAppSelector } from '../../hooks';
import { parseApiError } from '../../lib/errors';
import {
  useDeleteUserMutation,
  useGetInvitationsQuery,
  useGetUsersQuery,
  useRevokeInvitationMutation,
  useUpdateUserRoleMutation,
} from '../../store/team/teamApi';
import type { Role, TeamMember } from '../../types';
import InviteFormModal from '../../components/InviteFormModal';
import { ROLE_STYLES, ROLES } from '../../constants/roles';

type ApiError = Parameters<typeof parseApiError>[0];

const errorText = (err: unknown): string => {
  const parsed = parseApiError(err as ApiError);
  return Object.values(parsed.fields)[0] ?? parsed.message;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function TeamPage() {
  const me = useAppSelector((s) => s.auth.user);
  const { data: users = [], isLoading, isError, refetch } = useGetUsersQuery();
  const { data: invitations = [] } = useGetInvitationsQuery();
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: removing }] = useDeleteUserMutation();
  const [revokeInvitation] = useRevokeInvitationMutation();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [toRemove, setToRemove] = useState<TeamMember | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const changeRole = async (user: TeamMember, role: Role) => {
    setActionError(null);
    setPendingId(user.id);
    try {
      await updateRole({ id: user.id, role }).unwrap();
    } catch (err) {
      setActionError(errorText(err));   // the select snaps back, because the cache never changed
    } finally {
      setPendingId(null);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    setRemoveError(null);
    try {
      await deleteUser(toRemove.id).unwrap();
      setToRemove(null);
    } catch (err) {
      setRemoveError(errorText(err));
    }
  };

  const revoke = async (id: number) => {
    setActionError(null);
    setRevokingId(id);
    try {
      await revokeInvitation(id).unwrap();
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Team</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {users.length} {users.length === 1 ? 'member' : 'members'} in your workspace
          </p>
        </div>
        <button type="button" onClick={() => setInviteOpen(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30">
          + Invite member
        </button>
      </div>

      {actionError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="font-medium underline">Dismiss</button>
        </div>
      )}

      <section aria-label="Members">
        {isLoading && <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-busy="true" />}

        {isError && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-red-700 dark:text-red-300">Could not load the team.</p>
            <button type="button" onClick={refetch}
                    className="mt-3 rounded-xl border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">
              Try again
            </button>
          </div>
        )}

        {users.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-136 text-left text-sm">
              <thead className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {u.name}
                          {isMe && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">You</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {isMe ? (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                        ) : (
                          <select
                            aria-label={`Role for ${u.name}`}
                            value={u.role}
                            disabled={pendingId === u.id}
                            onChange={(e) => changeRole(u, e.target.value as Role)}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 scheme-light focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:scheme-dark [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                          >
                            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {!isMe && (
                          <button type="button" onClick={() => { setRemoveError(null); setToRemove(u); }}
                                  className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="Pending invitations" className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Pending invitations</h2>

        {invitations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No pending invitations.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{inv.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inv.invited_by ? `Invited by ${inv.invited_by.name}` : 'Invited'} ·{' '}
                    {inv.expired ? <span className="text-red-600 dark:text-red-400">Expired {formatDate(inv.expires_at)}</span> : `Expires ${formatDate(inv.expires_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[inv.role]}`}>{inv.role}</span>
                  <button type="button" onClick={() => revoke(inv.id)} disabled={revokingId === inv.id}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10">
                    {revokingId === inv.id ? 'Revoking…' : inv.expired ? 'Remove' : 'Revoke'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InviteFormModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <ConfirmDialog
        open={toRemove !== null}
        title="Remove member?"
        message={`${toRemove?.name ?? ''} will lose access immediately. Their projects will be transferred to you and their task assignments cleared.`}
        confirmLabel="Remove"
        loading={removing}
        error={removeError}
        onConfirm={confirmRemove}
        onClose={() => setToRemove(null)}
      />
    </div>
  );
}