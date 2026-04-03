import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useGetMyClassesQuery } from './teacherApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ViewClasses = () => {
  const { data, isLoading } = useGetMyClassesQuery();

  if (isLoading) return <LoadingSpinner />;

  const classes = data?.data?.data || [];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">My Classes</Typography>

      {classes.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls._id}>
              <CardContent>
                <Typography variant="h6">{cls.name}</Typography>
                <Typography variant="body2" color="text.secondary" className="mb-3">
                  Section {cls.section} | {cls.academicYear}
                </Typography>
                <Box className="flex items-center gap-2">
                  <PeopleIcon fontSize="small" color="action" />
                  <Chip
                    label={`${cls.students?.length || 0} / ${cls.maxStrength} students`}
                    size="small" variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" className="text-center py-8">
              No classes assigned yet.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ViewClasses;
