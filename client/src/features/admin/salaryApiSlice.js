import apiSlice from '@/api/apiSlice';

const salaryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get salary structures
    getSalaryStructures: builder.query({
      query: ({ staffType, designation } = {}) => {
        const params = {};
        if (staffType) params.staffType = staffType;
        if (designation) params.designation = designation;
        return { url: '/salary/structure', params };
      },
      providesTags: ['Salary'],
    }),

    // Create salary structure
    createSalaryStructure: builder.mutation({
      query: (data) => ({
        url: '/salary/structure',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Salary'],
    }),

    // Update salary structure
    updateSalaryStructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/salary/structure/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Salary'],
    }),

    // Delete salary structure
    deleteSalaryStructure: builder.mutation({
      query: (id) => ({
        url: `/salary/structure/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Salary'],
    }),

    // Get salary payments
    getSalaryPayments: builder.query({
      query: ({ staffId, staffType, status, month, year } = {}) => {
        const params = {};
        if (staffId) params.staffId = staffId;
        if (staffType) params.staffType = staffType;
        if (status) params.status = status;
        if (month) params.month = month;
        if (year) params.year = year;
        return { url: '/salary/payments', params };
      },
      providesTags: ['Salary'],
    }),

    // Get pending salaries
    getPendingSalaries: builder.query({
      query: ({ month, year } = {}) => {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;
        return { url: '/salary/pending', params };
      },
      providesTags: ['Salary'],
    }),

    // Get salary statistics
    getSalaryStats: builder.query({
      query: ({ month, year } = {}) => ({
        url: '/salary/stats',
        params: { month, year },
      }),
      providesTags: ['Salary'],
    }),

    // Record salary payment
    recordSalaryPayment: builder.mutation({
      query: (data) => ({
        url: '/salary/pay',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Salary'],
    }),

    // Generate monthly salary
    generateMonthlySalary: builder.mutation({
      query: (data) => ({
        url: '/salary/generate',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Salary'],
    }),

    // Get staff salary history
    getStaffSalaryHistory: builder.query({
      query: (staffId) => ({
        url: `/salary/staff/${staffId}`,
      }),
      providesTags: ['Salary'],
    }),
  }),
});

export const {
  useGetSalaryStructuresQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useDeleteSalaryStructureMutation,
  useGetSalaryPaymentsQuery,
  useGetPendingSalariesQuery,
  useGetSalaryStatsQuery,
  useRecordSalaryPaymentMutation,
  useGenerateMonthlySalaryMutation,
  useGetStaffSalaryHistoryQuery,
} = salaryApiSlice;

export default salaryApiSlice;
