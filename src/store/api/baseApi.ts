import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../../store/auth/authSlice';
import type { RootState } from '../../store/store';
import type { AuthPayload } from '../../types/index';
import { getSocketId } from '../../lib/echo';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',   // REQUIRED so the refresh cookie is stored and sent
  prepareHeaders: (headers, { getState }) => {
  const token = (getState() as RootState).auth.token;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');

  const socketId = getSocketId();
  if (socketId) headers.set('X-Socket-ID', socketId);   // lets Laravel skip the sender

  return headers;
},
});

type Api = Parameters<typeof rawBaseQuery>[1];
type Extra = Parameters<typeof rawBaseQuery>[2];

// One refresh at a time: concurrent 401s all wait on the same promise
let refreshing: Promise<AuthPayload | null> | null = null;

function refreshTokens(api: Api, extra: Extra): Promise<AuthPayload | null> {
  refreshing ??= (async () => {
    const res = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra);
    return res.data ? (res.data as AuthPayload) : null;
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extra) => {
    let result = await rawBaseQuery(args, api, extra);
    const url = typeof args === 'string' ? args : args.url;

    // Never refresh because of an /auth/* call (avoids loops)
    if (result.error?.status === 401 && !url.startsWith('/auth/')) {
      const payload = await refreshTokens(api, extra);

      if (payload) {
        api.dispatch(setCredentials(payload));
        result = await rawBaseQuery(args, api, extra);   // retry with the new token
      } else {
        api.dispatch(logout());
      }
    }

    return result;
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'Task', 'User', 'AuditLog', 'Stats'],
  endpoints: () => ({}),
});