import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import Field from '../../components/Field';
import Modal from '../../components/Modal';
import TextAreaField from '../../components/TextAreaField';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { useCreateProjectMutation, useUpdateProjectMutation } from '../../store/projects/projectsApi';
import type { Project } from '../../types';

interface ProjectFormModalProps {
  open: boolean;
  project?: Project | null;   // present = edit, absent = create
  onClose: () => void;
}

export default function ProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'New project'}>
      <ProjectForm project={project} onClose={onClose} />
    </Modal>
  );
}

function ProjectForm({ project, onClose }: { project?: Project | null; onClose: () => void }) {
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState<ParsedError | null>(null);

  const saving = creating || updating;

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    const body = { name: name.trim(), description: description.trim() || null };

    try {
      if (project) await updateProject({ id: project.id, ...body }).unwrap();
      else await createProject(body).unwrap();
      onClose();
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  const fields = error?.fields ?? {};
  const generic = error && Object.keys(fields).length === 0 ? error.message : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {generic && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {generic}
        </div>
      )}

      <Field label="Name" name="name" value={name} placeholder="Website redesign" required autoFocus
             onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} error={fields.name} />
      <TextAreaField label="Description" name="description" value={description}
                     placeholder="What is this project about? (optional)"
                     onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                     error={fields.description} />

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}