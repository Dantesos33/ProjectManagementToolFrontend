import { baseApi } from '../api/baseApi';
import type { Paginated, Project, ProjectInput } from '../../types';

const unwrap = (res: { data: Project }) => res.data;

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Paginated<Project>, number | void>({
      query: (page = 1) => ({ url: '/projects', params: { page } }),
      providesTags: (result) => [
        { type: 'Project', id: 'LIST' },
        ...(result?.data.map(({ id }) => ({ type: 'Project' as const, id })) ?? []),
      ],
    }),

    getProject: build.query<Project, number>({
      query: (id) => `/projects/${id}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),

    createProject: build.mutation<Project, ProjectInput>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: 'Project', id: 'LIST' }, 'Stats'],
    }),

    updateProject: build.mutation<Project, { id: number } & ProjectInput>({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Project', id }],
    }),

    deleteProject: build.mutation<void, number>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Project', id }, { type: 'Project', id: 'LIST' }, 'Stats'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;