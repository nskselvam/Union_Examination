import { BASE_URL } from "../constraint/constraint";
import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `/api/auth/login`,
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/auth/password_reset",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword_mail: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/email-sent",
        method: "POST",
        body: data,
      }),
    }),

    UserLockData: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/userlock",
        method: "POST",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
    }),
    registraton: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/registration",
        method: "POST",
        body: data,
      }),
    }),
    userdataget: builder.query({
      query: () => ({
        url: "/api/v1/auth/userdata",
        method: "GET",
      }),
    }),
    final_submit: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/final_submit",
        method: "POST",
      }),
    }),
    acceptTerms: builder.mutation({
      query: (data) => ({
        url: "/api/auth/accept-terms",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegistratonMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useResetPassword_mailMutation,
  useUserLockDataMutation,
  useFinal_submitMutation,
  useUserdatagetQuery,
  useAcceptTermsMutation,
} = authApiSlice;
