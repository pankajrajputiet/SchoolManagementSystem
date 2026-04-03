import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import {
  useGetFeePaymentsQuery,
  useGetFeeStatsQuery,
  useRecordPaymentMutation,
} from './feeApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import dayjs from 'dayjs';

const FEE_TYPES = {
  tuition: 'Tuition',
  transport: 'Transport',
  library: 'Library',
  sports: 'Sports',
  lab: 'Lab',
  exam: 'Exam',
  annual: 'Annual',
  other: 'Other',
};

const getStatusColor = (status) => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    partial: 'info',
    overdue: 'error',
    waived: 'default',
  };
  return colors[status] || 'default';
};

const StatCard = ({ title, value, subtitle, color }) => (
  <Card>
    <CardContent>
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
    </CardContent>
  </Card>
);

const FeeManagement = () => {
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');

  const { data: paymentsData, isLoading: loadingPayments } = useGetFeePaymentsQuery({
    academicYear,
    status: statusFilter,
  });

  const { data: statsData } = useGetFeeStatsQuery({ academicYear });
  const [recordPayment] = useRecordPaymentMutation();

  const payments = paymentsData?.data || [];
  const stats = statsData?.data || {};

  const handleOpenPaymentDialog = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.balanceAmount || (fee.amount - fee.amountPaid));
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    try {
      await recordPayment({
        studentId: selectedFee.student._id,
        feeStructureId: selectedFee._id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId,
      }).unwrap();
      
      setPaymentDialogOpen(false);
      setSelectedFee(null);
      setPaymentAmount('');
      setTransactionId('');
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Fee Management
      </Typography>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pending?.count || 0}
            subtitle={`$${stats.pending?.pending || 0}`}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Partial"
            value={stats.partial?.count || 0}
            subtitle={`$${stats.partial?.pending || 0}`}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid"
            value={stats.paid?.count || 0}
            subtitle={`$${stats.paid?.paid || 0}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue"
            value={stats.overdue?.count || 0}
            subtitle={`$${stats.overdue?.pending || 0}`}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Payments Table */}
      <Card>
        <CardContent>
          {loadingPayments ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Fee Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((fee) => (
                    <TableRow key={fee._id} hover>
                      <TableCell>
                        {fee.student?.user?.name || 'N/A'}
                        <Typography variant="caption" color="text.secondary" className="block">
                          Roll: {fee.student?.rollNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{FEE_TYPES[fee.feeType] || fee.feeType}</TableCell>
                      <TableCell>${fee.amount}</TableCell>
                      <TableCell>${fee.amountPaid}</TableCell>
                      <TableCell>${fee.balanceAmount}</TableCell>
                      <TableCell>{dayjs(fee.dueDate).format('DD MMM YYYY')}</TableCell>
                      <TableCell>
                        <Chip
                          label={fee.status}
                          color={getStatusColor(fee.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {fee.status !== 'paid' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenPaymentDialog(fee)}
                          >
                            <PaymentIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent className="space-y-3" style={{ minWidth: 400 }}>
          {selectedFee && (
            <>
              <Typography variant="body2" className="mb-2">
                Student: <strong>{selectedFee.student?.user?.name}</strong>
              </Typography>
              <Typography variant="body2" className="mb-2">
                Fee Type: <strong>{FEE_TYPES[selectedFee.feeType]}</strong>
              </Typography>
              <Typography variant="body2" className="mb-2">
                Balance: <strong>${selectedFee.balanceAmount}</strong>
              </Typography>
              
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                label="Transaction ID (optional)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} variant="contained">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeManagement;
