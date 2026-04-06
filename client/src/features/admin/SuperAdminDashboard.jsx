import { Box, Typography, Card, CardContent, Grid, Button, LinearProgress, Chip } from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import axiosInstance from '@/api/axiosInstance';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="body2" color="text.secondary" className="mb-1">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: `${color}.lighter`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await axiosInstance.get('/stats/system');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const schoolStats = stats?.schools || {};
  const userStats = stats?.users || {};
  const roleCounts = userStats.byRole || {};

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Super Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.name}!
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/superadmin/schools')}
        >
          Add New School
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Schools"
            value={schoolStats.total || 0}
            icon={<SchoolIcon />}
            color="primary"
            subtitle={`${schoolStats.recent || 0} added this week`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={userStats.total || 0}
            icon={<PeopleIcon />}
            color="success"
            subtitle={`${userStats.active || 0} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Schools"
            value={schoolStats.active || 0}
            icon={<CheckCircleIcon />}
            color="info"
            subtitle={`${schoolStats.inactive || 0} inactive`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats?.students?.total || 0}
            icon={<PersonIcon />}
            color="warning"
            subtitle={`${stats?.teachers?.total || 0} teachers`}
          />
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                User Distribution by Role
              </Typography>
              <Box className="space-y-4">
                <Box>
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2">School Admins</Typography>
                    <Typography variant="body2" fontWeight="bold">{roleCounts.school_admin || 0}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats.total ? ((roleCounts.school_admin || 0) / userStats.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Box>
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2">Teachers</Typography>
                    <Typography variant="body2" fontWeight="bold">{roleCounts.teacher || 0}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats.total ? ((roleCounts.teacher || 0) / userStats.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                    color="success"
                  />
                </Box>
                <Box>
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2">Students</Typography>
                    <Typography variant="body2" fontWeight="bold">{roleCounts.student || 0}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats.total ? ((roleCounts.student || 0) / userStats.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                    color="info"
                  />
                </Box>
                <Box>
                  <Box className="flex justify-between mb-1">
                    <Typography variant="body2">Super Admins</Typography>
                    <Typography variant="body2" fontWeight="bold">{roleCounts.super_admin || 0}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats.total ? ((roleCounts.super_admin || 0) / userStats.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                    color="warning"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                System Overview
              </Typography>
              <Box className="space-y-3">
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Typography variant="body2">Total Classes</Typography>
                  <Chip 
                    label={stats?.classes?.total || 0} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Typography variant="body2">Total Teachers</Typography>
                  <Chip 
                    label={stats?.teachers?.total || 0} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Typography variant="body2">Total Students</Typography>
                  <Chip 
                    label={stats?.students?.total || 0} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Typography variant="body2">Active Users</Typography>
                  <Chip 
                    label={`${userStats.active || 0} (${userStats.total ? Math.round(((userStats.active || 0) / userStats.total) * 100) : 0}%)`} 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                  />
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Typography variant="body2">Schools (This Week)</Typography>
                  <Chip 
                    label={schoolStats.recent || 0} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Schools */}
      {stats?.topSchools && stats.topSchools.length > 0 && (
        <Card className="mb-6">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Top Schools by Student Count
            </Typography>
            <Grid container spacing={2}>
              {stats.topSchools.map((school, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box className="p-3 bg-gray-50 rounded-lg">
                    <Typography variant="body1" fontWeight="medium" className="mb-1">
                      #{index + 1} {school.schoolName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {school.studentCount} students
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/superadmin/schools')}
                sx={{ py: 2 }}
              >
                Manage Schools
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/superadmin/users')}
                sx={{ py: 2 }}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/superadmin/reports')}
                sx={{ py: 2 }}
              >
                View Reports
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/superadmin/settings')}
                sx={{ py: 2 }}
              >
                System Settings
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminDashboard;
