import apiSlice from '@/api/apiSlice';

const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyStudentProfile: builder.query({
      query: () => ({ url: '/students/me' }),
      providesTags: ['Student'],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({ url: '/attendance', params }),
      providesTags: ['Attendance'],
    }),
    getMyMarks: builder.query({
      query: (params) => ({ url: '/marks', params }),
      providesTags: ['Mark'],
    }),
    getMyAssignments: builder.query({
      query: (params) => ({ url: '/assignments', params }),
      providesTags: ['Assignment'],
    }),
    submitAssignment: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/assignments/${id}/submit`,
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: ['Assignment'],
    }),
  }),
});

export const {
  useGetMyStudentProfileQuery,
  useGetMyAttendanceQuery,
  useGetMyMarksQuery,
  useGetMyAssignmentsQuery,
  useSubmitAssignmentMutation,
} = studentApiSlice;

export default studentApiSlice;
