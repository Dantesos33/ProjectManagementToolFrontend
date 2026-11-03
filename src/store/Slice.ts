import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

export const Slice = createApi({
    baseQuery: fetchBaseQuery({baseUrl: "http://localhost:8000/api"}),
    endpoints: (builder) => ({
       getTodos: builder.query<Todo[], void>({
        query: () => "/todo",
       }),
    }),
});

export const { useGetTodosQuery } = Slice;