import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { School as SchoolIcon, People as PeopleIcon } from '@mui/icons-material';
import axiosInstance from '@/api/axiosInstance';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StatCard = ({ title, value, icon, color }) => (
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

const SuperAdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [schoolsRes] = await Promise.all([
        axiosInstance.get('/schools?limit=1000'),
      ]);
      
      const schools = schoolsRes.data.data.data || [];
      setStats({
        totalSchools: schools.length,
        activeSchools: schools.filter(s => s.isActive).length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        System Reports
      </Typography>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Schools"
            value={stats?.totalSchools || 0}
            icon={<SchoolIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Schools"
            value={stats?.activeSchools || 0}
            icon={<SchoolIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Detailed Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced reporting features including per-school analytics, user activity tracking, and performance metrics will be available here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminReports;
