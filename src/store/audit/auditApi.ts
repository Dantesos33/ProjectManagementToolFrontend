import { baseApi } from '../api/baseApi';
import type { AuditLog, Paginated } from '../../types';

export interface AuditFilters {
  page: number;
  entity: string;   // '' = all
  event: string;
  userId: string;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<Paginated<AuditLog>, AuditFilters>({
      query: ({ page, entity, event, userId }) => ({
        url: '/audit-logs',
        // undefined params are dropped from the query string
        params: { page, entity: entity || undefined, event: event || undefined, user_id: userId || undefined },
      }),
      providesTags: ['AuditLog'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;