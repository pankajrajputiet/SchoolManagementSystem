import { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  useGetTeachersQuery, useAddTeacherMutation,
  useUpdateTeacherMutation, useDeleteTeacherMutation,
} from './adminApiSlice';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useDebounce from '@/hooks/useDebounce';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email().required('Email is required'),
  password: yup.string().when('$isEdit', { is: false, then: (s) => s.min(6).required('Password is required') }),
  employeeId: yup.string().required('Employee ID is required'),
  qualification: yup.string().required('Qualification is required'),
  experience: yup.number().min(0).default(0),
});

const ManageTeachers = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useGetTeachersQuery({ page: page + 1, limit: pageSize, search: debouncedSearch });
  const [addTeacher, { isLoading: adding }] = useAddTeacherMutation();
  const [updateTeacher, { isLoading: updating }] = useUpdateTeacherMutation();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!editTeacher },
  });

  const openAdd = () => {
    setEditTeacher(null);
    reset({ name: '', email: '', password: '', employeeId: '', qualification: '', experience: 0, salary: '' });
    setFormOpen(true);
  };

  const openEdit = (teacher) => {
    setEditTeacher(teacher);
    reset({
      name: teacher.user?.name, email: teacher.user?.email,
      employeeId: teacher.employeeId, qualification: teacher.qualification,
      experience: teacher.experience, salary: teacher.salary || '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      setError('');
      if (editTeacher) {
        await updateTeacher({ id: editTeacher._id, ...formData }).unwrap();
      } else {
        await addTeacher(formData).unwrap();
      }
      setFormOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    await deleteTeacher(deleteId).unwrap();
    setDeleteId(null);
  };

  const columns = [
    { field: 'employeeId', headerName: 'Employee ID', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: (value, row) => row.user?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: (value, row) => row.user?.email },
    { field: 'qualification', headerName: 'Qualification', width: 150 },
    { field: 'experience', headerName: 'Exp (yrs)', width: 100 },
    {
      field: 'actions', headerName: 'Actions', width: 150, sortable: false,
      renderCell: (params) => (
        <Box className="flex gap-1">
          <Button size="small" onClick={() => openEdit(params.row)}><EditIcon fontSize="small" /></Button>
          <Button size="small" color="error" onClick={() => setDeleteId(params.row._id)}><DeleteIcon fontSize="small" /></Button>
        </Box>
      ),
    },
  ];

  const rows = (data?.data?.data || []).map((t) => ({ ...t, id: t._id }));

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Typography variant="h5">Manage Teachers</Typography>
        <Box className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Teacher</Button>
        </Box>
      </Box>

      <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={rows} columns={columns} loading={isLoading}
          paginationMode="server"
          rowCount={data?.data?.pagination?.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTeacher ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-3">
            {error && <Alert severity="error">{error}</Alert>}
            <Controller name="name" control={control} render={({ field }) => (
              <TextField fullWidth label="Full Name" {...field} error={!!formErrors.name} helperText={formErrors.name?.message} />
            )} />
            <Controller name="email" control={control} render={({ field }) => (
              <TextField fullWidth label="Email" type="email" {...field} disabled={!!editTeacher} error={!!formErrors.email} helperText={formErrors.email?.message} />
            )} />
            {!editTeacher && (
              <Controller name="password" control={control} render={({ field }) => (
                <TextField fullWidth label="Password" type="password" {...field} error={!!formErrors.password} helperText={formErrors.password?.message} />
              )} />
            )}
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="employeeId" control={control} render={({ field }) => (
                <TextField fullWidth label="Employee ID" {...field} error={!!formErrors.employeeId} helperText={formErrors.employeeId?.message} />
              )} />
              <Controller name="qualification" control={control} render={({ field }) => (
                <TextField fullWidth label="Qualification" {...field} error={!!formErrors.qualification} helperText={formErrors.qualification?.message} />
              )} />
            </Box>
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="experience" control={control} render={({ field }) => (
                <TextField fullWidth label="Experience (years)" type="number" {...field} />
              )} />
              <Controller name="salary" control={control} render={({ field }) => (
                <TextField fullWidth label="Salary" type="number" {...field} />
              )} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={adding || updating}>
              {editTeacher ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Delete Teacher" message="This will deactivate the teacher account. Continue?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
};

export default ManageTeachers;
