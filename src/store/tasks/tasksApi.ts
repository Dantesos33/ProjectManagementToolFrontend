import { baseApi } from '../api/baseApi';
import type { Task, TaskInput, TaskStatus } from '../../types';

const unwrap = (res: { data: Task }) => res.data;
const listTag = (projectId: number) => ({ type: 'Task' as const, id: `LIST-${projectId}` });

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], number>({
      query: (projectId) => `/projects/${projectId}/tasks`,
      transformResponse: (res: { data: Task[] }) => res.data,
      providesTags: (result, _e, projectId) => [
        listTag(projectId),
        ...(result?.map(({ id }) => ({ type: 'Task' as const, id })) ?? []),
      ],
    }),

    createTask: build.mutation<Task, { projectId: number } & TaskInput>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/tasks`, method: 'POST', body,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { projectId }) => [listTag(projectId), { type: 'Project', id: 'LIST' }, 'Stats'],
    }),

    updateTask: build.mutation<Task, { id: number; projectId: number } & Omit<TaskInput, 'status'>>({
      query: ({ id, projectId: _projectId, ...body }) => ({
        url: `/tasks/${id}`, method: 'PATCH', body,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Task', id }, 'Stats'],   // due date may change "overdue"
    }),

    deleteTask: build.mutation<void, { id: number; projectId: number }>({
      query: ({ id }) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { projectId }) => [listTag(projectId), { type: 'Project', id: 'LIST' }, 'Stats'],
    }),

    updateTaskStatus: build.mutation<
      Task,
      { id: number; projectId: number; status: TaskStatus; position: number }
    >({
      query: ({ id, status, position }) => ({
        url: `/tasks/${id}/status`, method: 'PATCH', body: { status, position },
      }),
      transformResponse: unwrap,

      async onQueryStarted({ id, projectId, status, position }, { dispatch, queryFulfilled }) {
        // 1. Move the card in the cache right now
        const patch = dispatch(
          tasksApi.util.updateQueryData('getTasks', projectId, (draft) => {
            const task = draft.find((t) => t.id === id);
            if (task) {
              task.status = status;
              task.position = position;
            }
          }),
        );

        // 2. Wait for the server; roll back if it refuses
        try {
          await queryFulfilled;
          dispatch(baseApi.util.invalidateTags(['Stats']));
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;