import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, Chip, Divider, IconButton, Tooltip, Tabs, Tab,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '@/api/axiosInstance';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const schema = yup.object({
  name: yup.string().required('School name is required').max(200),
  code: yup.string().optional().max(20),
  phone: yup.string().optional(),
  email: yup.string().email().optional(),
  principalName: yup.string().optional(),
  affiliatedBoard: yup.string().optional(),
  schoolType: yup.string().oneOf(['public', 'private', 'government', 'international']).default('private'),
  maxStudents: yup.number().integer().min(100).default(5000),
  // Admin credentials (only required for new schools)
  adminName: yup.string().when('$isNew', {
    is: true,
    then: (schema) => schema.required('Admin name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  adminEmail: yup.string().when('$isNew', {
    is: true,
    then: (schema) => schema.email('Invalid email').required('Admin email is required'),
    otherwise: (schema) => schema.optional(),
  }),
  adminPassword: yup.string().when('$isNew', {
    is: true,
    then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Admin password is required'),
    otherwise: (schema) => schema.optional(),
  }),
});

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editSchool, setEditSchool] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [recoverId, setRecoverId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 for active, 1 for inactive

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema, { context: { isNew: !editSchool } }),
    context: { isNew: !editSchool },
  });

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/schools?limit=100');
      setSchools(response.data.data.data || []);
    } catch (err) {
      setError('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const openAdd = () => {
    setEditSchool(null);
    reset({
      name: '',
      code: '',
      phone: '',
      email: '',
      principalName: '',
      affiliatedBoard: '',
      schoolType: 'private',
      maxStudents: 5000,
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    });
    setFormOpen(true);
  };

  const openEdit = (school) => {
    setEditSchool(school);
    reset({
      name: school.name,
      code: school.code,
      phone: school.phone || '',
      email: school.email || '',
      principalName: school.principalName || '',
      affiliatedBoard: school.affiliatedBoard || '',
      schoolType: school.schoolType || 'private',
      maxStudents: school.maxStudents || 5000,
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      setError('');
      setSuccess('');
      setSubmitLoading(true);
      
      if (editSchool) {
        await axiosInstance.put(`/schools/${editSchool._id}`, formData);
        setSuccess('School updated successfully');
      } else {
        const response = await axiosInstance.post('/schools', formData);
        setSuccess('School created successfully');
        
        // Log the response for debugging
        console.log('School created:', response.data);
      }
      
      // Close form and reset
      setFormOpen(false);
      setEditSchool(null);
      reset({
        name: '',
        code: '',
        phone: '',
        email: '',
        principalName: '',
        affiliatedBoard: '',
        schoolType: 'private',
        maxStudents: 5000,
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
      
      // Refresh schools list
      await fetchSchools();
    } catch (err) {
      setError(err?.response?.data?.message || 'Operation failed');
      console.error('School creation error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/schools/${deleteId}`);
      setSuccess('School deactivated successfully');
      setDeleteId(null);
      fetchSchools();
    } catch (err) {
      setError('Failed to delete school');
    }
  };

  const handleRecover = async () => {
    try {
      await axiosInstance.patch(`/schools/${recoverId}/recover`);
      setSuccess('School recovered successfully');
      setRecoverId(null);
      fetchSchools();
    } catch (err) {
      setError('Failed to recover school');
    }
  };

  const columns = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'School Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'principalName', headerName: 'Principal', width: 150 },
    { 
      field: 'affiliatedBoard', 
      headerName: 'Board', 
      width: 120,
      valueFormatter: (value) => value || '-'
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: tabValue === 1 ? 100 : 150,
      sortable: false,
      renderCell: (params) => (
        <Box className="flex gap-1">
          {params.row.isActive ? (
            <>
              <Button size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </Button>
              <Button size="small" color="error" onClick={() => setDeleteId(params.row._id)}>
                <DeleteIcon fontSize="small" />
              </Button>
            </>
          ) : (
            <Tooltip title="Recover School">
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => setRecoverId(params.row._id)}
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const filteredRows = schools
    .filter(s => tabValue === 0 ? s.isActive : !s.isActive)
    .map((s) => ({ ...s, id: s._id }));

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5">Manage Schools</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add School
        </Button>
      </Box>

      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {/* Tabs for Active/Inactive schools */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Active Schools" />
          <Tab label="Inactive Schools" />
        </Tabs>
      </Box>

      <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            disableRowSelectionOnClick
          />
        )}
      </Box>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editSchool ? 'Edit School' : 'Add School'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-3">
            {error && <Alert severity="error">{error}</Alert>}
            
            <Controller name="name" control={control} render={({ field }) => (
              <TextField fullWidth label="School Name" {...field} required />
            )} />
            
            <Controller name="code" control={control} render={({ field }) => (
              <TextField fullWidth label="School Code (optional)" {...field} />
            )} />
            
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="phone" control={control} render={({ field }) => (
                <TextField fullWidth label="Phone" {...field} />
              )} />
              <Controller name="email" control={control} render={({ field }) => (
                <TextField fullWidth label="Email" type="email" {...field} />
              )} />
            </Box>
            
            <Controller name="principalName" control={control} render={({ field }) => (
              <TextField fullWidth label="Principal Name" {...field} />
            )} />
            
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="affiliatedBoard" control={control} render={({ field }) => (
                <TextField fullWidth select label="Board" {...field}>
                  {BOARDS.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </TextField>
              )} />
              <Controller name="schoolType" control={control} render={({ field }) => (
                <TextField fullWidth select label="Type" {...field}>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="government">Government</MenuItem>
                  <MenuItem value="international">International</MenuItem>
                </TextField>
              )} />
            </Box>
            
            <Controller name="maxStudents" control={control} render={({ field }) => (
              <TextField fullWidth label="Max Students" type="number" {...field} />
            )} />

            {/* Admin Credentials Section - Only for new schools */}
            {!editSchool && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" color="primary">School Admin Credentials</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Create an admin account for this school
                </Typography>
                
                <Controller name="adminName" control={control} render={({ field }) => (
                  <TextField fullWidth label="Admin Name" {...field} required />
                )} />
                
                <Controller name="adminEmail" control={control} render={({ field }) => (
                  <TextField fullWidth label="Admin Email" type="email" {...field} required />
                )} />
                
                <Controller name="adminPassword" control={control} render={({ field }) => (
                  <TextField fullWidth label="Admin Password" type="password" {...field} required />
                )} />
              </>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setFormOpen(false)} disabled={submitLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitLoading}>
              {submitLoading ? 'Processing...' : (editSchool ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Deactivate School"
        message="This will deactivate the school and all its users. Continue?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!recoverId}
        title="Recover School"
        message="This will reactivate the school and all its users. Continue?"
        onConfirm={handleRecover}
        onCancel={() => setRecoverId(null)}
      />
    </Box>
  );
};

export default ManageSchools;
