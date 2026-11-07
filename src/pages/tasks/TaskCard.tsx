import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../../types';
import { PRIORITIES, PRIORITY_STYLES } from '../../constants/index';

interface TaskCardProps {
  task: Task;
  index: number;
  canMove: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const todayISO = () => new Date().toLocaleDateString('en-CA');   // local YYYY-MM-DD

const formatDue = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function TaskCard({ task, index, canMove, canEdit, canDelete, onEdit, onDelete }: TaskCardProps) {
  const overdue = !!task.due_date && task.status !== 'completed' && task.due_date < todayISO();
  const priorityLabel = PRIORITIES.find((p) => p.value === task.priority)?.label;

  return (
    <Draggable draggableId={String(task.id)} index={index} isDragDisabled={!canMove}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl border bg-white p-3.5 shadow-sm transition-shadow dark:bg-slate-900 ${
            snapshot.isDragging
              ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-500/20 dark:border-indigo-500'
              : 'border-slate-200 hover:shadow-md dark:border-slate-800'
          } ${canMove ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {priorityLabel}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-500 dark:text-slate-400">
              {task.assignee?.name ?? 'Unassigned'}
            </span>
            {task.due_date && (
              <span className={overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
                {overdue ? 'Overdue · ' : ''}{formatDue(task.due_date)}
              </span>
            )}
          </div>

          {(canEdit || canDelete) && (
            <div className="mt-3 flex gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
              {canEdit && (
                <button type="button" onClick={() => onEdit(task)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Edit
                </button>
              )}
              {canDelete && (
                <button type="button" onClick={() => onDelete(task)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  Delete
                </button>
              )}
            </div>
          )}
        </li>
      )}
    </Draggable>
  );
}