import { BASE_URL } from "../constraint/constraint";
import { apiSlice } from "./apiSlice";

export const NavBarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    navbardata: builder.mutation({
      query: (data) => ({
        url: `/api/navbar/dataNav`,
        method: "POST",
        body: data,
      }),
    }),
    getNavbarMenu: builder.query({
      query: (data) => ({
        url: `/api/navbar/dataNav`,
        method: "GET",
        params: data,
      }),
    }),
  }),
});

export const {
  useNavbardataMutation,
  useGetNavbarMenuQuery
} = NavBarApiSlice;
