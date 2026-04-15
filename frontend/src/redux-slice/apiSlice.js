import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {BASE_URL} from "../constraint/constraint"

const baseQuery = fetchBaseQuery({
    baseUrl:BASE_URL,
    credentials:"include",
    timeout: 60000, // 60 second timeout
    prepareHeaders: (headers, { getState }) => {
        console.log('Preparing headers for request');
        // Add current route path to headers
        const currentPath = window.location.pathname.substring(1); // Remove leading slash
        if (currentPath) {
            headers.set('x-current-route', currentPath);
            console.log('Added route header:', currentPath);
        }
        return headers;
    },
});

// Enhanced base query with error logging
const baseQueryWithLogging = async (args, api, extraOptions) => {
    console.log('Making request:', { args, extraOptions });
    const result = await baseQuery(args, api, extraOptions);
    console.log('Request result:', result);
    if (result.error) {
        console.error('Request error:', result.error);
    }
    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithLogging,
    tagTypes: ["questionSend","Qresponse","Auth","UserData","CommonData"],
    endpoints: (builder) => ({})
});