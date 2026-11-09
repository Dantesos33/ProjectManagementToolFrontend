import { useState } from 'react';
import SelectField from '../../components/SelectField';
import { useGetAuditLogsQuery, type AuditFilters } from '../../store/audit/auditApi';
import { useGetMembersQuery } from '../../store/members/membersApi';
import type { AuditLog } from '../../types';

const EVENT_STYLES: Record<string, string> = {
  created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  updated: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  deleted: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

const show = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
};

function Changes({ log }: { log: AuditLog }) {
  const fields = Array.from(
    new Set([...Object.keys(log.old_values ?? {}), ...Object.keys(log.new_values ?? {})]),
  );

  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium">Before</th>
            <th className="px-3 py-2 font-medium">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {fields.map((f) => (
            <tr key={f}>
              <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{f}</td>
              <td className="max-w-xs wrap-break-words px-3 py-2 text-red-700 dark:text-red-300">{show(log.old_values?.[f])}</td>
              <td className="max-w-xs wrap-break-words px-3 py-2 text-emerald-700 dark:text-emerald-300">{show(log.new_values?.[f])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditLogPage() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, entity: '', event: '', userId: '' });
  const [openId, setOpenId] = useState<number | null>(null);

  const { data: members = [] } = useGetMembersQuery();
  const { data, isLoading, isFetching, isError, refetch } = useGetAuditLogsQuery(filters, {
    refetchOnMountOrArgChange: true,                   // always fresh when you open the page
    pollingInterval: filters.page === 1 ? 30_000 : 0,  // catches changes that aren't broadcast
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const setFilter = (key: 'entity' | 'event' | 'userId', value: string) => {
    setOpenId(null);
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Audit log</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every change to projects and tasks in your workspace. Entries can't be edited or deleted.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Item" name="entity" value={filters.entity} onChange={(e) => setFilter('entity', e.target.value)}>
          <option value="">All items</option>
          <option value="task">Tasks</option>
          <option value="project">Projects</option>
          <option value="user">Members</option>
          <option value="invitation">Invitations</option>
        </SelectField>
        <SelectField label="Action" name="event" value={filters.event} onChange={(e) => setFilter('event', e.target.value)}>
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
        </SelectField>
        <SelectField label="Person" name="user" value={filters.userId} onChange={(e) => setFilter('userId', e.target.value)}>
          <option value="">Everyone</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </SelectField>
      </div>

      {isLoading && (
        <ul className="space-y-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </ul>
      )}

      {isError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-700 dark:text-red-300">Could not load the audit log.</p>
          <button type="button" onClick={refetch}
                  className="mt-3 rounded-xl border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No activity found</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Changes will show up here as your team works.</p>
        </div>
      )}

      {logs.length > 0 && (
        <ul className={`divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white transition-opacity dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 ${isFetching ? 'opacity-60' : ''}`}>
          {logs.map((log) => {
            const event = log.action.split('.')[1] ?? log.action;
            const hasDetails = !!(log.old_values || log.new_values);
            const open = openId === log.id;

            return (
              <li key={log.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${EVENT_STYLES[event] ?? EVENT_STYLES.updated}`}>
                        {event}
                      </span>
                      <span className="text-xs capitalize text-slate-400 dark:text-slate-500">
                        {log.entity} #{log.entity_id}
                      </span>
                    </div>
                    <p className="mt-1.5 wrap-break-words text-sm text-slate-900 dark:text-slate-100">{log.description}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {log.user?.name ?? 'Deleted user'} · {new Date(log.created_at).toLocaleString()}
                      {log.ip_address && ` · ${log.ip_address}`}
                    </p>
                  </div>

                  {hasDetails && (
                    <button type="button" onClick={() => setOpenId(open ? null : log.id)} aria-expanded={open}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">
                      {open ? 'Hide details' : 'Details'}
                    </button>
                  )}
                </div>

                {open && <Changes log={log} />}
              </li>
            );
          })}
        </ul>
      )}

      {meta && meta.last_page > 1 && (
        <nav className="flex items-center justify-between" aria-label="Pagination">
          <button type="button" onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} disabled={filters.page <= 1}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Newer
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Page {meta.current_page} of {meta.last_page}</span>
          <button type="button" onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} disabled={filters.page >= meta.last_page}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Older
          </button>
        </nav>
      )}
    </div>
  );
}