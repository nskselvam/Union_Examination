
import { apiSlice } from "./apiSlice";
export const valuationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getExaminerResetPassword: builder.query({
            query: (data) => ({
                url: `/api/examiner`,
                method: "GET",
                params: data,
            }),
        }),
        resetExaminerPassword: builder.mutation({
            query: (data) => ({
                url: `/api/examiner`,
                method: "POST",
                body: data,
            }),
        }),
        getExaminerPasswordDetails: builder.query({
            query: (data) => ({
                url: `/api/examiner/password-details`,
                method: "GET",
                params: data,
            }),
        }),

        sendExaminerPassword: builder.mutation({
            query: (data) => ({
                url: `/api/examiner/password-details`,
                method: "POST",
                body: data,
            }),
        }),
        getExaminerUserDetails: builder.query({
            query: (data) => ({
                url: `/api/examiner/user-details`,
                method: "POST",
                body: data,
            }),

        }),
    }),
});
export const { useGetExaminerResetPasswordQuery, useResetExaminerPasswordMutation, useGetExaminerPasswordDetailsQuery, useSendExaminerPasswordMutation, useGetExaminerUserDetailsQuery } = valuationApiSlice;