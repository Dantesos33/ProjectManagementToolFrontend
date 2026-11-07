import { useAppSelector, useAppCan } from '../hooks/index';
import { useGetDashboardStatsQuery } from '../store/dashboard/dashboardApi';
import type { DashboardStats } from '../types';

const STATS: { label: string; key: keyof DashboardStats }[] = [
  { label: 'Projects', key: 'projects' },
  { label: 'Open tasks', key: 'open_tasks' },
  { label: 'Completed', key: 'completed_tasks' },
  { label: 'Overdue', key: 'overdue_tasks' },
];

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const can = useAppCan();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();

  const access: [string, boolean][] = [
    ['View projects and tasks', can.viewProjects],
    ['Move tasks between columns', can.moveTask],
    ['Create projects and tasks', can.createProject],
    ['Edit and delete tasks', can.editTask],
    ['Manage team members', can.manageUsers],
    ['View audit log', can.viewAudit],
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {greeting()}, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here is an overview of your workspace.
        </p>
      </div>

      <section aria-label="Statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, key }) => (
          <div key={key}
               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            {statsLoading ? (
              <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className={`mt-2 text-3xl font-semibold ${
                key === 'overdue_tasks' && (stats?.[key] ?? 0) > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {stats?.[key] ?? '—'}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Your access</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          What you can do as <span className="font-medium capitalize">{user?.role}</span>.
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {access.map(([label, allowed]) => (
            <li key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  allowed
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-slate-50 text-slate-400 line-through dark:bg-slate-800/50 dark:text-slate-500'
                }`}>
              <span aria-hidden="true">{allowed ? '✓' : '✗'}</span>
              <span className="sr-only">{allowed ? 'Allowed:' : 'Not allowed:'}</span>
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}