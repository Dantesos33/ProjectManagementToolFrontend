import { baseApi } from '../api/baseApi';
import type { Invitation, Role, TeamMember } from '../../types';

export const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<TeamMember[], void>({
      query: () => '/users',
      transformResponse: (res: { data: TeamMember[] }) => res.data,
      providesTags: ['User'],
    }),

    updateUserRole: build.mutation<TeamMember, { id: number; role: Role }>({
      query: ({ id, role }) => ({ url: `/users/${id}`, method: 'PATCH', body: { role } }),
      transformResponse: (res: { data: TeamMember }) => res.data,
      invalidatesTags: ['User'],
    }),

    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      // their projects change owner and their task assignments are cleared
      invalidatesTags: ['User', 'Task', { type: 'Project', id: 'LIST' }],
    }),

    getInvitations: build.query<Invitation[], void>({
      query: () => '/invitations',
      transformResponse: (res: { data: Invitation[] }) => res.data,
      providesTags: ['Invitation'],
    }),

    createInvitation: build.mutation<Invitation, { email: string; role: Role }>({
      query: (body) => ({ url: '/invitations', method: 'POST', body }),
      transformResponse: (res: { data: Invitation; link?: string }) => ({ ...res.data, link: res.link }),
      invalidatesTags: ['Invitation'],
    }),

    revokeInvitation: build.mutation<void, number>({
      query: (id) => ({ url: `/invitations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Invitation'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
} = teamApi;