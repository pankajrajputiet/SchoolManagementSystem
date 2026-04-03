import apiSlice from '@/api/apiSlice';

const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Students
    getStudents: builder.query({
      query: (params) => ({ url: '/students', params }),
      providesTags: ['Student'],
    }),
    addStudent: builder.mutation({
      query: (data) => ({ url: '/students', method: 'POST', data }),
      invalidatesTags: ['Student', 'Class'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/students/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Student'],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Student', 'Class'],
    }),
    // Teachers
    getTeachers: builder.query({
      query: (params) => ({ url: '/teachers', params }),
      providesTags: ['Teacher'],
    }),
    addTeacher: builder.mutation({
      query: (data) => ({ url: '/teachers', method: 'POST', data }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/teachers/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Teacher'],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({ url: `/teachers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Teacher'],
    }),
    // Classes
    getClasses: builder.query({
      query: (params) => ({ url: '/classes', params }),
      providesTags: ['Class'],
    }),
    getClassById: builder.query({
      query: (id) => ({ url: `/classes/${id}` }),
      providesTags: ['Class'],
    }),
    addClass: builder.mutation({
      query: (data) => ({ url: '/classes', method: 'POST', data }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/classes/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),
    // Subjects
    getSubjects: builder.query({
      query: (params) => ({ url: '/subjects', params }),
      providesTags: ['Subject'],
    }),
    addSubject: builder.mutation({
      query: (data) => ({ url: '/subjects', method: 'POST', data }),
      invalidatesTags: ['Subject', 'Class'],
    }),
    // Reports
    getAttendanceReport: builder.query({
      query: (params) => ({ url: '/attendance/report', params }),
    }),
    getMarksReport: builder.query({
      query: (params) => ({ url: '/marks/report', params }),
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetTeachersQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetClassesQuery,
  useGetClassByIdQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSubjectsQuery,
  useAddSubjectMutation,
  useGetAttendanceReportQuery,
  useGetMarksReportQuery,
} = adminApiSlice;

export default adminApiSlice;
