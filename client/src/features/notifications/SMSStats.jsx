import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid,
  Button, Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useGetSMSStatsQuery, useGetSMSServiceStatusQuery } from './smsApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

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

const SMSStats = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: loadingStats, refetch } = useGetSMSStatsQuery();
  const { data: statusData, isLoading: loadingStatus } = useGetSMSServiceStatusQuery();

  if (loadingStats || loadingStatus) return <LoadingSpinner />;

  const stats = statsData?.data || {};
  const status = statusData?.data || {};

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">SMS Statistics</Typography>
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/admin/sms-history')}
          >
            SMS History
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => navigate('/admin/sms')}
          >
            Send SMS
          </Button>
        </Box>
      </Box>

      {/* Service Status */}
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="mb-4">Service Status</Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box>
              <Typography variant="caption" color="text.secondary">SMS Service</Typography>
              <Box className="flex items-center gap-2 mt-1">
                {status.enabled ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Typography variant="body2" fontWeight="medium">
                  {status.enabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Provider</Typography>
              <Typography variant="body2" fontWeight="medium" className="mt-1">
                {status.provider || 'Twilio'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">School Phone</Typography>
              <Typography variant="body2" fontWeight="medium" className="mt-1">
                {status.schoolPhone || '-'}
              </Typography>
            </Box>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total SMS Sent"
            value={stats.totalSent || 0}
            icon={<SendIcon />}
            color="primary"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Successful"
            value={stats.successful || 0}
            icon={<CheckCircleIcon />}
            color="success"
            subtitle={`${stats.successRate || 0}% success rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Failed"
            value={stats.failed || 0}
            icon={<ErrorIcon />}
            color="error"
            subtitle={`${stats.failureRate || 0}% failure rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled"
            value={stats.scheduled || 0}
            icon={<ScheduleIcon />}
            color="info"
            subtitle="Pending delivery"
          />
        </Grid>
      </Grid>

      {/* Category Breakdown */}
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="mb-4">Category Breakdown</Typography>
          {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {stats.categoryBreakdown.map((item) => (
                <Box key={item.category}>
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="body2" textTransform="capitalize">
                      {item.category}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {item.count} SMS
                    </Typography>
                  </Box>
                  <Box className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <Box
                      className="bg-primary h-full"
                      sx={{
                        width: `${stats.totalSent > 0 ? (item.count / stats.totalSent) * 100 : 0}%`,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </div>
          ) : (
            <Typography color="text.secondary">No category data available</Typography>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">Monthly Activity</Typography>
          {stats.monthlyActivity && stats.monthlyActivity.length > 0 ? (
            <div className="space-y-2">
              {stats.monthlyActivity.slice(-6).map((month) => (
                <Box key={month.month} className="flex justify-between items-center">
                  <Typography variant="body2">{month.month}</Typography>
                  <Box className="flex gap-4">
                    <Typography variant="body2" color="success.main">
                      ✓ {month.successful}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      ✗ {month.failed}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      Total: {month.total}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </div>
          ) : (
            <Typography color="text.secondary">No monthly activity data</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SMSStats;
