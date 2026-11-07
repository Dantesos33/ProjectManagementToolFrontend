import { baseApi } from '../api/baseApi';
import type { DashboardStats } from '../../types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (res: { data: DashboardStats }) => res.data,
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;