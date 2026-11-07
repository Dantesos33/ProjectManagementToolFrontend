import { baseApi } from '../api/baseApi';
import type { Member } from '../../types';

export const membersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMembers: build.query<Member[], void>({
      query: () => '/members',
      transformResponse: (res: { data: Member[] }) => res.data,
    }),
  }),
});

export const { useGetMembersQuery } = membersApi;