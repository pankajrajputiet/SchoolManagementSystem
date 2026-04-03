import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from './axiosInstance';

const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || { message: error.message },
        },
      };
    }
  };

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Student',
    'Teacher',
    'Class',
    'Subject',
    'Attendance',
    'Mark',
    'Assignment',
    'Notification',
    'User',
    'Fee',
  ],
  endpoints: () => ({}),
});

export default apiSlice;
