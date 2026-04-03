import { Card, CardContent, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useGetStudentsQuery, useGetTeachersQuery, useGetClassesQuery } from './adminApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent className="flex items-center gap-4">
      <Box
        className="p-3 rounded-lg"
        sx={{ bgcolor: `${color}.50` }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: studentsData, isLoading: loadingStudents } = useGetStudentsQuery({ limit: 1 });
  const { data: teachersData, isLoading: loadingTeachers } = useGetTeachersQuery({ limit: 1 });
  const { data: classesData, isLoading: loadingClasses } = useGetClassesQuery({ limit: 1 });

  if (loadingStudents || loadingTeachers || loadingClasses) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      title: 'Total Students',
      value: studentsData?.data?.pagination?.total || 0,
      icon: <PeopleIcon sx={{ color: 'primary.main', fontSize: 32 }} />,
      color: 'primary',
    },
    {
      title: 'Total Teachers',
      value: teachersData?.data?.pagination?.total || 0,
      icon: <SchoolIcon sx={{ color: 'secondary.main', fontSize: 32 }} />,
      color: 'secondary',
    },
    {
      title: 'Total Classes',
      value: classesData?.data?.pagination?.total || 0,
      icon: <ClassIcon sx={{ color: 'success.main', fontSize: 32 }} />,
      color: 'success',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Admin Dashboard
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-2">
            Quick Actions
          </Typography>
          <Typography color="text.secondary">
            Use the sidebar to manage students, teachers, classes, and view reports.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
