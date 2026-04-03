import { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useGetMyStudentProfileQuery, useGetMyAttendanceQuery } from './studentApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusChip from '@/components/common/StatusChip';
import { formatDate } from '@/utils/formatters';

const ViewAttendance = () => {
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: profileData } = useGetMyStudentProfileQuery();
  const student = profileData?.data;

  const { data, isLoading } = useGetMyAttendanceQuery(
    {
      student: student?._id,
      page: page + 1,
      limit: 20,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    { skip: !student?._id }
  );

  if (!student) return <LoadingSpinner />;

  const records = data?.data?.data || [];
  const total = data?.data?.pagination?.total || 0;

  const columns = [
    { field: 'date', headerName: 'Date', flex: 1, valueGetter: (value) => formatDate(value) },
    { field: 'status', headerName: 'Status', width: 130, renderCell: (params) => <StatusChip status={params.value} /> },
    { field: 'remarks', headerName: 'Remarks', flex: 1, valueGetter: (value) => value || '-' },
    { field: 'markedBy', headerName: 'Marked By', width: 150, valueGetter: (value) => value?.name || '-' },
  ];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">My Attendance</Typography>

      <Card className="mb-4">
        <CardContent>
          <Box className="flex gap-4 flex-wrap">
            <TextField label="From" type="date" size="small" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="To" type="date" size="small" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ height: 500, bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={records.map((r) => ({ ...r, id: r._id }))}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={total}
          paginationModel={{ page, pageSize: 20 }}
          onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[20]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ViewAttendance;
