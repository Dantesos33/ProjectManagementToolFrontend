import { Link, useParams } from 'react-router-dom';
import Placeholder from '../../pages/Placeholder';
import { useGetProjectQuery } from '../../store/projects/projectsApi';

export default function ProjectBoardPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const validId = Number.isInteger(projectId) && projectId > 0;

  const { data: project, isLoading, error } = useGetProjectQuery(projectId, { skip: !validId });

  if (!validId || (error && 'status' in error && error.status === 404)) {
    return <Placeholder title="404 · Project not found" description="It may have been deleted, or it belongs to another workspace." showHome />;
  }

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />;
  }

  if (!project) {
    return <Placeholder title="Something went wrong" description="Could not load this project." showHome />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">← All projects</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{project.name}</h1>
        {project.description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
        )}
      </div>

      <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-20 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        The Kanban board will appear here in the next step.
      </div>
    </div>
  );
}