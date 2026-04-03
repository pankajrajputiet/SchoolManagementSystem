import apiSlice from '@/api/apiSlice';

const smsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send SMS
    sendSMS: builder.mutation({
      query: (data) => ({
        url: '/sms/send',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['SMS'],
    }),

    // Get SMS history (Admin)
    getSMSHistory: builder.query({
      query: ({ page = 1, limit = 10, category, status } = {}) => {
        const params = { page, limit };
        if (category) params.category = category;
        if (status) params.status = status;
        return { url: '/sms/history', params };
      },
      providesTags: ['SMS'],
    }),

    // Get SMS statistics (Admin)
    getSMSStats: builder.query({
      query: () => '/sms/stats',
      providesTags: ['SMS'],
    }),

    // Get SMS templates
    getSMSTemplates: builder.query({
      query: () => '/sms/templates',
      providesTags: ['SMS'],
    }),

    // Get SMS service status
    getSMSServiceStatus: builder.query({
      query: () => '/sms/status',
      providesTags: ['SMS'],
    }),

    // Get SMS details (Admin)
    getSMSDetails: builder.query({
      query: (id) => `/sms/${id}`,
      providesTags: ['SMS'],
    }),

    // Get classes for SMS targeting (reuse existing classes endpoint)
    getClassesForSMS: builder.query({
      query: () => ({
        url: '/classes',
        params: { limit: 100 },
      }),
      providesTags: ['Class'],
    }),

    // Get students in a class for SMS targeting
    getClassStudentsForSMS: builder.query({
      query: (classId) => `/classes/${classId}/students`,
      providesTags: ['Student'],
    }),
  }),
});

export const {
  useSendSMSMutation,
  useGetSMSHistoryQuery,
  useGetSMSStatsQuery,
  useGetSMSTemplatesQuery,
  useGetSMSServiceStatusQuery,
  useGetSMSDetailsQuery,
  useGetClassesForSMSQuery,
  useGetClassStudentsForSMSQuery,
} = smsApiSlice;

export default smsApiSlice;
