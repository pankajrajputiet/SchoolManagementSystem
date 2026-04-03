import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import { useGetMyTeacherProfileQuery, useGetMyClassesQuery } from './teacherApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TeacherDashboard = () => {
  const { data: profile, isLoading: loadingProfile } = useGetMyTeacherProfileQuery();
  const { data: classesData, isLoading: loadingClasses } = useGetMyClassesQuery();

  if (loadingProfile || loadingClasses) return <LoadingSpinner />;

  const teacher = profile?.data;
  const classes = classesData?.data?.data || [];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Welcome, {teacher?.user?.name}
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <ClassIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">{classes.length}</Typography>
              <Typography color="text.secondary">Assigned Classes</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
              </Typography>
              <Typography color="text.secondary">Total Students</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">My Classes</Typography>
          {classes.length > 0 ? (
            <Box className="space-y-2">
              {classes.map((cls) => (
                <Box key={cls._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <Box>
                    <Typography fontWeight="medium">{cls.name} - {cls.section}</Typography>
                    <Typography variant="body2" color="text.secondary">{cls.academicYear}</Typography>
                  </Box>
                  <Chip label={`${cls.students?.length || 0} students`} size="small" color="primary" variant="outlined" />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No classes assigned yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherDashboard;
