import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useCan } from '../../hooks/useCan';
import { parseApiError } from '../../lib/errors';
import { useDeleteProjectMutation, useGetProjectsQuery } from '../../store/projects/projectsApi';
import type { Project } from '../../types';
import ProjectFormModal from './ProjectFormModal';

type FormTarget = { project: Project | null } | null;   // null = closed, project null = create

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function ProjectsPage() {
  const can = useCan();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetProjectsQuery(page);
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();

  const [form, setForm] = useState<FormTarget>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const projects = data?.data ?? [];
  const meta = data?.meta;
  const showActions = can.editProject || can.deleteProject;

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);

    try {
      await deleteProject(toDelete.id).unwrap();
      if (projects.length === 1 && page > 1) setPage(page - 1);   // that was the last card here
      setToDelete(null);
    } catch (err) {
      setDeleteError(parseApiError(err as Parameters<typeof parseApiError>[0]).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {meta ? `${meta.total} ${meta.total === 1 ? 'project' : 'projects'} in your workspace` : 'Your workspace projects'}
          </p>
        </div>

        {can.createProject && (
          <button type="button" onClick={() => setForm({ project: null })}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30">
            + New project
          </button>
        )}
      </div>

      {isLoading && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </ul>
      )}

      {isError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-700 dark:text-red-300">Could not load projects.</p>
          <button type="button" onClick={refetch}
                  className="mt-3 rounded-xl border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {can.createProject
              ? 'Create your first project to start organising tasks.'
              : 'A manager or admin needs to create a project first.'}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <ul className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
          {projects.map((p) => (
            <li key={p.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <Link to={`/projects/${p.id}`}
                    className="flex-1 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20">
                <h2 className="font-semibold text-slate-900 dark:text-white">{p.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {p.description ?? 'No description'}
                </p>
              </Link>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>
                  {p.tasks_count ?? 0} {p.tasks_count === 1 ? 'task' : 'tasks'} · {formatDate(p.created_at)}
                </span>

                {showActions && (
                  <div className="flex gap-1">
                    {can.editProject && (
                      <button type="button" onClick={() => setForm({ project: p })}
                              className="rounded-lg px-2 py-1 font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        Edit
                      </button>
                    )}
                    {can.deleteProject && (
                      <button type="button" onClick={() => { setDeleteError(null); setToDelete(p); }}
                              className="rounded-lg px-2 py-1 font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.last_page > 1 && (
        <nav className="flex items-center justify-between" aria-label="Pagination">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.last_page}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Next
          </button>
        </nav>
      )}

      <ProjectFormModal open={form !== null} project={form?.project} onClose={() => setForm(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete project?"
        message={`"${toDelete?.name ?? ''}" and all of its tasks will be permanently deleted. This cannot be undone.`}
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}