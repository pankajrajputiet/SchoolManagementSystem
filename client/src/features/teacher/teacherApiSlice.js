import apiSlice from '@/api/apiSlice';

const teacherApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyTeacherProfile: builder.query({
      query: () => ({ url: '/teachers/me' }),
      providesTags: ['Teacher'],
    }),
    getMyClasses: builder.query({
      query: () => ({ url: '/classes', params: { limit: 100 } }),
      providesTags: ['Class'],
    }),
    getClassStudents: builder.query({
      query: (classId) => ({ url: `/classes/${classId}` }),
      providesTags: ['Class'],
    }),
    markAttendanceBulk: builder.mutation({
      query: (data) => ({ url: '/attendance', method: 'POST', data }),
      invalidatesTags: ['Attendance'],
    }),
    getAttendanceByClass: builder.query({
      query: (params) => ({ url: '/attendance', params }),
      providesTags: ['Attendance'],
    }),
    uploadMarksBulk: builder.mutation({
      query: (data) => ({ url: '/marks', method: 'POST', data }),
      invalidatesTags: ['Mark'],
    }),
    getMarksByClass: builder.query({
      query: (params) => ({ url: '/marks', params }),
      providesTags: ['Mark'],
    }),
    getTeacherAssignments: builder.query({
      query: (params) => ({ url: '/assignments', params }),
      providesTags: ['Assignment'],
    }),
    createAssignment: builder.mutation({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'files') {
            value.forEach((file) => formData.append('files', file));
          } else {
            formData.append(key, value);
          }
        });
        return { url: '/assignments', method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } };
      },
      invalidatesTags: ['Assignment'],
    }),
    getSubjectsByClass: builder.query({
      query: (params) => ({ url: '/subjects', params }),
      providesTags: ['Subject'],
    }),
  }),
});

export const {
  useGetMyTeacherProfileQuery,
  useGetMyClassesQuery,
  useGetClassStudentsQuery,
  useMarkAttendanceBulkMutation,
  useGetAttendanceByClassQuery,
  useUploadMarksBulkMutation,
  useGetMarksByClassQuery,
  useGetTeacherAssignmentsQuery,
  useCreateAssignmentMutation,
  useGetSubjectsByClassQuery,
} = teacherApiSlice;

export default teacherApiSlice;
