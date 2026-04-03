import { Box, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useGetAttendanceReportQuery, useGetMarksReportQuery } from './adminApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];

const Reports = () => {
  const { data: attendanceData, isLoading: loadingAtt } = useGetAttendanceReportQuery({});
  const { data: marksData, isLoading: loadingMarks } = useGetMarksReportQuery({});

  if (loadingAtt || loadingMarks) return <LoadingSpinner />;

  const attReport = attendanceData?.data?.report || [];
  const gradeReport = marksData?.data?.gradeDistribution || [];
  const summary = marksData?.data?.summary || {};

  return (
    <Box>
      <Typography variant="h5" className="mb-6">Reports</Typography>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Attendance Overview</Typography>
            {attReport.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={attReport} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                    {attReport.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" className="text-center py-8">No attendance data available</Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Grade Distribution</Typography>
            {gradeReport.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeReport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1565c0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" className="text-center py-8">No marks data available</Typography>
            )}
          </CardContent>
        </Card>

        {summary.totalStudents > 0 && (
          <Card className="lg:col-span-2">
            <CardContent>
              <Typography variant="h6" className="mb-4">Marks Summary</Typography>
              <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Students', value: summary.totalStudents },
                  { label: 'Average Marks', value: summary.averageMarks?.toFixed(1) },
                  { label: 'Highest Marks', value: summary.highestMarks },
                  { label: 'Lowest Marks', value: summary.lowestMarks },
                ].map((item) => (
                  <Box key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Typography variant="h5" fontWeight="bold">{item.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Reports;
