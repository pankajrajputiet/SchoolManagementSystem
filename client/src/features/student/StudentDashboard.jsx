import { Box, Typography, Card, CardContent } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradingIcon from '@mui/icons-material/Grading';
import ClassIcon from '@mui/icons-material/Class';
import { useGetMyStudentProfileQuery } from './studentApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { data, isLoading } = useGetMyStudentProfileQuery();

  if (isLoading) return <LoadingSpinner />;

  const student = data?.data;

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Welcome, {student?.user?.name}
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <ClassIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {student?.class?.name} {student?.section}
              </Typography>
              <Typography color="text.secondary">Current Class</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <EventNoteIcon sx={{ fontSize: 40, color: 'success.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">{student?.rollNumber}</Typography>
              <Typography color="text.secondary">Roll Number</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <GradingIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {student?.class?.academicYear}
              </Typography>
              <Typography color="text.secondary">Academic Year</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Profile Details</Typography>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Email', value: student?.user?.email },
              { label: 'Phone', value: student?.user?.phone || 'N/A' },
              { label: 'Gender', value: student?.gender },
              { label: 'Parent Name', value: student?.parentName },
              { label: 'Parent Phone', value: student?.parentPhone },
              { label: 'Address', value: student?.address || 'N/A' },
            ].map((item) => (
              <Box key={item.label} className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography className="capitalize">{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
