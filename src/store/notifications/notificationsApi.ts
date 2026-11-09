import { baseApi } from '../api/baseApi';
import type { AppNotification } from '../../types';

interface NotificationsResponse {
  data: AppNotification[];
  unread_count: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsResponse, void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markRead: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: build.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } = notificationsApi;