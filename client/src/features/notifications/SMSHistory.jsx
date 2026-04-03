import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, TextField,
  Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useGetSMSHistoryQuery, useGetSMSDetailsQuery } from './smsApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const SMS_CATEGORIES = [
  { value: 'fees', label: 'Fee Reminder', color: 'warning' },
  { value: 'vacation', label: 'Vacation/Holiday', color: 'info' },
  { value: 'exam', label: 'Exam Notification', color: 'primary' },
  { value: 'absence', label: 'Student Absence', color: 'error' },
  { value: 'emergency', label: 'Emergency Alert', color: 'error' },
  { value: 'custom', label: 'Custom Message', color: 'default' },
];

const SMS_STATUSES = [
  { value: 'sent', label: 'Sent', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'failed', label: 'Failed', color: 'error' },
  { value: 'partial', label: 'Partial', color: 'warning' },
];

const getCategoryColor = (category) => {
  const cat = SMS_CATEGORIES.find((c) => c.value === category);
  return cat?.color || 'default';
};

const getCategoryLabel = (category) => {
  const cat = SMS_CATEGORIES.find((c) => c.value === category);
  return cat?.label || category;
};

const getStatusColor = (status) => {
  const stat = SMS_STATUSES.find((s) => s.value === status);
  return stat?.color || 'default';
};

const getStatusLabel = (status) => {
  const stat = SMS_STATUSES.find((s) => s.value === status);
  return stat?.label || status;
};

const SMSHistory = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, refetch } = useGetSMSHistoryQuery({
    page: page + 1,
    limit: pageSize,
    category: category || undefined,
    status: status || undefined,
  });

  const { data: detailsData } = useGetSMSDetailsQuery(selectedId, {
    skip: !selectedId,
  });

  const smsList = data?.data?.data || [];
  const total = data?.data?.pagination?.total || 0;
  const details = detailsData?.data;

  const handleViewDetails = (id) => {
    setSelectedId(id);
    setDetailsOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setCategory('');
    setStatus('');
    setPage(0);
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">SMS History</Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => navigate('/admin/sms')}
        >
          Send New SMS
        </Button>
      </Box>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {SMS_CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {SMS_STATUSES.map((stat) => (
                <MenuItem key={stat.value} value={stat.value}>
                  {stat.label}
                </MenuItem>
              ))}
            </TextField>

            <div className="flex items-end gap-2">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
                fullWidth
              >
                Refresh
              </Button>
              <Button
                variant="text"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : smsList.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No SMS records found
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell>Sent</TableCell>
                      <TableCell>Failed</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {smsList.map((sms) => (
                      <TableRow key={sms._id} hover>
                        <TableCell>
                          {dayjs(sms.sentAt || sms.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategoryLabel(sms.category)}
                            color={getCategoryColor(sms.category)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(sms.status)}
                            color={getStatusColor(sms.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{sms.totalRecipients || '-'}</TableCell>
                        <TableCell>{sms.successfullySent || 0}</TableCell>
                        <TableCell>{sms.failed?.length || 0}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(sms._id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>SMS Details</DialogTitle>
        <DialogContent>
          {details ? (
            <Box className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Box>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Chip
                    label={getCategoryLabel(details.category)}
                    color={getCategoryColor(details.category)}
                    size="small"
                    className="ml-2"
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={getStatusLabel(details.status)}
                    color={getStatusColor(details.status)}
                    size="small"
                    className="ml-2"
                  />
                </Box>
              </div>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" className="block mb-1">
                  Message
                </Typography>
                <Typography variant="body2" className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {details.message}
                </Typography>
              </Box>

              <div className="grid grid-cols-3 gap-4">
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Recipients</Typography>
                  <Typography variant="h6">{details.totalRecipients || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Successfully Sent</Typography>
                  <Typography variant="h6" color="success.main">{details.successfullySent || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Failed</Typography>
                  <Typography variant="h6" color="error.main">{details.failed?.length || 0}</Typography>
                </Box>
              </div>

              {details.sentAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Sent At</Typography>
                  <Typography variant="body2">
                    {dayjs(details.sentAt).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                </Box>
              )}

              {details.deliveryReports && details.deliveryReports.length > 0 && (
                <>
                  <Divider />
                  <Typography variant="subtitle2">Delivery Reports</Typography>
                  <Box className="max-h-64 overflow-y-auto space-y-2">
                    {details.deliveryReports.map((report, idx) => (
                      <Box key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {report.studentName || report.phoneNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.status}
                          </Typography>
                        </Box>
                        <Chip
                          label={report.status}
                          color={report.status === 'delivered' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <LoadingSpinner />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SMSHistory;
