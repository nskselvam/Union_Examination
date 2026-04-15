import { apiSlice } from "./apiSlice";
export const pdfApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPdfData: builder.query({
        query: (data) => ({
            url: `/api/v1/pdf/question-paper`,
            method: "POST",
            data: data,
        }),
    }),
  }),
});

export const { useGetPdfDataQuery } = pdfApiSlice;
