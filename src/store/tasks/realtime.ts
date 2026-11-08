import { baseApi } from '../api/baseApi';
import type { AppDispatch } from '../store';
import { tasksApi } from '../../store/tasks/tasksApi';
import type { Task } from '../../types';

export interface TaskChangedPayload {
  action: 'created' | 'updated' | 'moved' | 'deleted';
  project_id: number;
  task_id: number;
  task: Task | null;
}

export function applyTaskEvent(dispatch: AppDispatch, e: TaskChangedPayload): void {
  // No-op if this project's tasks aren't in the cache (nobody is viewing that board)
  dispatch(
    tasksApi.util.updateQueryData('getTasks', e.project_id, (draft) => {
      if (e.action === 'deleted' || !e.task) {
        const i = draft.findIndex((t) => t.id === e.task_id);
        if (i !== -1) draft.splice(i, 1);
        return;
      }

      const existing = draft.find((t) => t.id === e.task_id);
      if (!existing) {
        draft.push(e.task);
        return;
      }

      // Ignore an event older than what we already have
      if (existing.updated_at > e.task.updated_at) return;
      Object.assign(existing, e.task);
    }),
  );

  // Dashboard numbers changed; project cards show task counts

  dispatch(
  baseApi.util.invalidateTags(
    e.action === 'created' || e.action === 'deleted'
      ? ['Stats', { type: 'Project', id: 'LIST' }]
      : ['Stats'],
  ),
);
}