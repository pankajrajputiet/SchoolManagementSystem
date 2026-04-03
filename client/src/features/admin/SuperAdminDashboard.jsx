import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

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

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            value="1"
            icon={<SchoolIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value="3"
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Schools"
            value="1"
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Status"
            value="Online"
            icon={<SchoolIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

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

      {/* Default School Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Default School
          </Typography>
          <Box className="bg-gray-50 p-4 rounded-lg">
            <Typography variant="body1" fontWeight="medium" className="mb-2">
              Demo School
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              Code: DEMO
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              Email: info@demosschool.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +919876543210
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuperAdminDashboard;
