import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Autorenew as GenerateIcon,
} from '@mui/icons-material';
import {
  useGetSalaryPaymentsQuery,
  useGetSalaryStatsQuery,
  useRecordSalaryPaymentMutation,
  useGenerateMonthlySalaryMutation,
} from './salaryApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import dayjs from 'dayjs';

const STAFF_TYPES = {
  teacher: 'Teacher',
  staff: 'Staff',
};

const getStatusColor = (status) => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    partial: 'info',
    overdue: 'error',
  };
  return colors[status] || 'default';
};

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online' },
];

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

const SalaryManagement = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const { data: salaryData, isLoading: loadingSalaries } = useGetSalaryPaymentsQuery({
    month,
    year,
    status: statusFilter,
  });

  const { data: statsData } = useGetSalaryStatsQuery({ month, year });
  const [recordPayment] = useRecordSalaryPaymentMutation();
  const [generateSalary] = useGenerateMonthlySalaryMutation();

  const salaries = salaryData?.data || [];
  const stats = statsData?.data || {};

  const handleOpenPaymentDialog = (salary) => {
    setSelectedSalary(salary);
    setPaymentAmount(salary.balanceAmount || (salary.netSalary - salary.paidAmount));
    setBankAccountNumber(salary.bankAccountNumber || '');
    setIfscCode(salary.ifscCode || '');
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    try {
      await recordPayment({
        salaryPaymentId: selectedSalary._id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId,
        bankAccountNumber,
        ifscCode,
      }).unwrap();

      setPaymentDialogOpen(false);
      setSelectedSalary(null);
      setPaymentAmount('');
      setTransactionId('');
      setBankAccountNumber('');
      setIfscCode('');
    } catch (err) {
      alert(err?.data?.message || 'Failed to record payment');
    }
  };

  const handleGenerateSalary = async () => {
    if (!confirm(`Generate salary for ${MONTHS.find(m => m.value === parseInt(month))?.label} ${year}?`)) {
      return;
    }

    try {
      await generateSalary({ month: parseInt(month), year: parseInt(year) }).unwrap();
      alert('Salary generated successfully');
    } catch (err) {
      alert(err?.data?.message || 'Failed to generate salary');
    }
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Salary Management
      </Typography>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                startIcon={<GenerateIcon />}
                onClick={handleGenerateSalary}
                fullWidth
              >
                Generate Salary
              </Button>
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
            subtitle={`$${stats.pending?.total || 0}`}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Partial"
            value={stats.partial?.count || 0}
            subtitle={`$${stats.partial?.paid || 0} paid`}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid"
            value={stats.paid?.count || 0}
            subtitle={`$${stats.paid?.total || 0}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total"
            value={stats.total?.count || 0}
            subtitle={`$${stats.total?.total || 0}`}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Salary Table */}
      <Card>
        <CardContent>
          {loadingSalaries ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary._id} hover>
                      <TableCell>
                        {salary.staff?.name || 'N/A'}
                        <Typography variant="caption" color="text.secondary" className="block">
                          {salary.designation || salary.staffType}
                        </Typography>
                      </TableCell>
                      <TableCell>{STAFF_TYPES[salary.staffType] || salary.staffType}</TableCell>
                      <TableCell>${salary.grossSalary}</TableCell>
                      <TableCell>
                        ${typeof salary.deductions === 'object' 
                          ? (Object.values(salary.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))
                          : salary.deductions}
                      </TableCell>
                      <TableCell><strong>${salary.netSalary}</strong></TableCell>
                      <TableCell>${salary.paidAmount}</TableCell>
                      <TableCell>${salary.balanceAmount}</TableCell>
                      <TableCell>
                        <Chip
                          label={salary.status}
                          color={getStatusColor(salary.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {salary.status !== 'paid' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenPaymentDialog(salary)}
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
        <DialogTitle>Record Salary Payment</DialogTitle>
        <DialogContent className="space-y-3" style={{ minWidth: 400 }}>
          {selectedSalary && (
            <>
              <Typography variant="body2" className="mb-2">
                Staff: <strong>{selectedSalary.staff?.name}</strong>
              </Typography>
              <Typography variant="body2" className="mb-2">
                Month: <strong>{MONTHS.find(m => m.value === selectedSalary.month)?.label} {selectedSalary.year}</strong>
              </Typography>
              <Typography variant="body2" className="mb-2">
                Net Salary: <strong>${selectedSalary.netSalary}</strong>
              </Typography>
              <Typography variant="body2" className="mb-2">
                Balance: <strong>${selectedSalary.balanceAmount}</strong>
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
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Bank Account Number"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
              />

              <TextField
                fullWidth
                label="IFSC Code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />

              <TextField
                fullWidth
                label="Transaction ID / Reference"
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

export default SalaryManagement;
