import apiSlice from '@/api/apiSlice';

const feeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee structures
    getFeeStructures: builder.query({
      query: ({ classId, academicYear, feeType } = {}) => {
        const params = {};
        if (classId) params.classId = classId;
        if (academicYear) params.academicYear = academicYear;
        if (feeType) params.feeType = feeType;
        return { url: '/fees/structure', params };
      },
      providesTags: ['Fee'],
    }),

    // Create fee structure
    createFeeStructure: builder.mutation({
      query: (data) => ({
        url: '/fees/structure',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Fee'],
    }),

    // Update fee structure
    updateFeeStructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/fees/structure/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Fee'],
    }),

    // Delete fee structure
    deleteFeeStructure: builder.mutation({
      query: (id) => ({
        url: `/fees/structure/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Fee'],
    }),

    // Get fee payments
    getFeePayments: builder.query({
      query: ({ classId, status, academicYear, studentName } = {}) => {
        const params = {};
        if (classId) params.classId = classId;
        if (status) params.status = status;
        if (academicYear) params.academicYear = academicYear;
        if (studentName) params.studentName = studentName;
        return { url: '/fees/payments', params };
      },
      providesTags: ['Fee'],
    }),

    // Get pending fees
    getPendingFees: builder.query({
      query: ({ classId, academicYear } = {}) => {
        const params = {};
        if (classId) params.classId = classId;
        if (academicYear) params.academicYear = academicYear;
        return { url: '/fees/pending', params };
      },
      providesTags: ['Fee'],
    }),

    // Get fee statistics
    getFeeStats: builder.query({
      query: ({ academicYear } = {}) => ({
        url: '/fees/stats',
        params: { academicYear },
      }),
      providesTags: ['Fee'],
    }),

    // Record payment
    recordPayment: builder.mutation({
      query: (data) => ({
        url: '/fees/pay',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Fee'],
    }),

    // Generate fee records
    generateFeeRecords: builder.mutation({
      query: (data) => ({
        url: '/fees/generate',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Fee'],
    }),

    // Get student fee status
    getStudentFeeStatus: builder.query({
      query: (studentId) => ({
        url: `/fees/student/${studentId}`,
      }),
      providesTags: ['Fee'],
    }),
  }),
});

export const {
  useGetFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useUpdateFeeStructureMutation,
  useDeleteFeeStructureMutation,
  useGetFeePaymentsQuery,
  useGetPendingFeesQuery,
  useGetFeeStatsQuery,
  useRecordPaymentMutation,
  useGenerateFeeRecordsMutation,
  useGetStudentFeeStatusQuery,
} = feeApiSlice;

export default feeApiSlice;
