import { useState, type SubmitEvent } from 'react';
import Field from '../../components/Field';
import Modal from '../../components/Modal';
import SelectField from '../../components/SelectField';
import TextAreaField from '../../components/TextAreaField';
import { parseApiError, type ParsedError } from '../../lib/errors';
import { useGetMembersQuery } from '../../store/members/membersApi';
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../store/tasks/tasksApi';
import type { Task, TaskPriority, TaskStatus } from '../../types';
import { COLUMNS, PRIORITIES } from '../../constants/index';

interface TaskFormModalProps {
  open: boolean;
  projectId: number;
  task?: Task | null;                 // present = edit
  defaultStatus?: TaskStatus;         // used when creating
  onClose: () => void;
}

export default function TaskFormModal({ open, projectId, task, defaultStatus = 'todo', onClose }: TaskFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      <TaskForm projectId={projectId} task={task} defaultStatus={defaultStatus} onClose={onClose} />
    </Modal>
  );
}

function TaskForm({ projectId, task, defaultStatus, onClose }: Omit<TaskFormModalProps, 'open'>) {
  const { data: members = [] } = useGetMembersQuery();
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? 'todo');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to ? String(task.assigned_to) : '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [error, setError] = useState<ParsedError | null>(null);

  const saving = creating || updating;

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    const body = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      assigned_to: assignedTo ? Number(assignedTo) : null,
      due_date: dueDate || null,
    };

    try {
      if (task) await updateTask({ id: task.id, projectId, ...body }).unwrap();
      else await createTask({ projectId, ...body, status }).unwrap();
      onClose();
    } catch (err) {
      setError(parseApiError(err as Parameters<typeof parseApiError>[0]));
    }
  };

  const f = error?.fields ?? {};
  const generic = error && Object.keys(f).length === 0 ? error.message : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {generic && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {generic}
        </div>
      )}

      <Field label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
             placeholder="Design the homepage" required autoFocus error={f.title} />
      <TextAreaField label="Description" name="description" value={description} rows={3}
                     onChange={(e) => setDescription(e.target.value)} error={f.description} />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Priority" name="priority" value={priority}
                     onChange={(e) => setPriority(e.target.value as TaskPriority)} error={f.priority}>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </SelectField>

        {!task && (
          <SelectField label="Column" name="status" value={status}
                       onChange={(e) => setStatus(e.target.value as TaskStatus)} error={f.status}>
            {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
          </SelectField>
        )}

        <SelectField label="Assignee" name="assigned_to" value={assignedTo}
                     onChange={(e) => setAssignedTo(e.target.value)} error={f.assigned_to}>
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </SelectField>

        <Field label="Due date" name="due_date" type="date" value={dueDate}
               onChange={(e) => setDueDate(e.target.value)} error={f.due_date} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button type="submit" disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}