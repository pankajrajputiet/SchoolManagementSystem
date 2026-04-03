import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetMyStudentProfileQuery, useGetMyMarksQuery } from './studentApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ViewMarks = () => {
  const { data: profileData } = useGetMyStudentProfileQuery();
  const student = profileData?.data;

  const { data, isLoading } = useGetMyMarksQuery(
    { student: student?._id, limit: 100 },
    { skip: !student?._id }
  );

  if (!student) return <LoadingSpinner />;

  const marks = data?.data?.data || [];

  const columns = [
    { field: 'subject', headerName: 'Subject', flex: 1, valueGetter: (value) => value?.name },
    { field: 'examType', headerName: 'Exam', width: 120, valueGetter: (value) => value?.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
    { field: 'marksObtained', headerName: 'Obtained', width: 100 },
    { field: 'totalMarks', headerName: 'Total', width: 100 },
    { field: 'percentage', headerName: '%', width: 80, valueGetter: (value, row) => ((row.marksObtained / row.totalMarks) * 100).toFixed(1) },
    { field: 'grade', headerName: 'Grade', width: 80 },
  ];

  // Chart data: group by subject
  const subjectMap = {};
  marks.forEach((m) => {
    const name = m.subject?.name || 'Unknown';
    if (!subjectMap[name]) subjectMap[name] = { subject: name, total: 0, obtained: 0, count: 0 };
    subjectMap[name].total += m.totalMarks;
    subjectMap[name].obtained += m.marksObtained;
    subjectMap[name].count += 1;
  });
  const chartData = Object.values(subjectMap).map((s) => ({
    subject: s.subject,
    percentage: ((s.obtained / s.total) * 100).toFixed(1),
  }));

  return (
    <Box>
      <Typography variant="h5" className="mb-6">My Marks</Typography>

      {chartData.length > 0 && (
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6" className="mb-4">Subject-wise Performance</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#1565c0" radius={[4, 4, 0, 0]} name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={marks.map((m) => ({ ...m, id: m._id }))}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ViewMarks;
