import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';
import type { RootState } from '../store';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
     const url = typeof args === 'string' ? args : args.url;

    if (result.error && result.error.status === 401 && !url.startsWith('/auth/')){
        api.dispatch(logout());
    }

    return result;

}


export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery,
    tagTypes: ['Project', 'Task', 'User', 'AuditLog'],
    endpoints: () => ({}),
    });
