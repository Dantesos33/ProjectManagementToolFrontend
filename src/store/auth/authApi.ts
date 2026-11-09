import { baseApi } from "../api/baseApi";
import type { AuthPayload, InvitationPreview } from "../../types";

export interface LoginBody {
  domain: string;
  email: string;
  password: string;
}
export interface RegisterBody {
  company_name: string;
  domain: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AcceptInviteBody {
  token: string;
  name: string;
  password: string;
  password_confirmation: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthPayload, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: build.mutation<AuthPayload, RegisterBody>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    logoutRequest: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    refresh: build.mutation<AuthPayload, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    previewInvitation: build.query<InvitationPreview, string>({
      query: (token) => ({
        url: "/auth/invitations/preview",
        method: "POST",
        body: { token },
      }),
      transformResponse: (res: { data: InvitationPreview }) => res.data,
    }),
    acceptInvite: build.mutation<AuthPayload, AcceptInviteBody>({
      query: (body) => ({ url: "/auth/accept-invite", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutRequestMutation,
  useRefreshMutation,
  usePreviewInvitationQuery,
  useAcceptInviteMutation,
} = authApi;
