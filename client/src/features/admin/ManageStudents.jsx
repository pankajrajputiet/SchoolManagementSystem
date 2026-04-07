import { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  useGetStudentsQuery, useAddStudentMutation,
  useUpdateStudentMutation, useDeleteStudentMutation, useGetClassesQuery,
} from './adminApiSlice';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useDebounce from '@/hooks/useDebounce';
import { SECTIONS, GENDERS } from '@/utils/constants';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email().required('Email is required'),
  password: yup.string().when('$isEdit', { is: false, then: (s) => s.min(6).required('Password is required') }),
  rollNumber: yup.string().required('Roll number is required'),
  class: yup.string().required('Class is required'),
  section: yup.string().required(),
  dateOfBirth: yup.string().required('DOB is required'),
  gender: yup.string().required('Gender is required'),
  parentName: yup.string().required('Parent name is required'),
  parentPhone: yup.string().required('Parent phone is required'),
});

const ManageStudents = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useGetStudentsQuery({
    page: page + 1, limit: pageSize, search: debouncedSearch,
  });
  const { data: classesData } = useGetClassesQuery({ limit: 100 });
  const [addStudent, { isLoading: adding }] = useAddStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!editStudent },
  });

  const openAdd = () => {
    setEditStudent(null);
    reset({ name: '', email: '', password: '', rollNumber: '', class: '', section: 'A', dateOfBirth: '', gender: '', parentName: '', parentPhone: '', address: '' });
    setFormOpen(true);
  };

  const openEdit = (student) => {
    setEditStudent(student);
    reset({
      name: student.user?.name, email: student.user?.email, rollNumber: student.rollNumber,
      class: student.class?._id, section: student.section,
      dateOfBirth: student.dateOfBirth?.slice(0, 10), gender: student.gender,
      parentName: student.parentName, parentPhone: student.parentPhone, address: student.address || '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      formData.schoolId = user.schoolId;
      setError('');
      if (editStudent) {
        await updateStudent({ id: editStudent._id, ...formData }).unwrap();
      } else {
        await addStudent(formData).unwrap();
      }
      setFormOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    await deleteStudent(deleteId).unwrap();
    setDeleteId(null);
  };

  const columns = [
    { field: 'rollNumber', headerName: 'Roll No', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1, valueGetter: (value, row) => row.user?.name },
    { field: 'email', headerName: 'Email', flex: 1, valueGetter: (value, row) => row.user?.email },
    { field: 'className', headerName: 'Class', width: 120, valueGetter: (value, row) => `${row.class?.name || ''} ${row.section}` },
    { field: 'gender', headerName: 'Gender', width: 100, valueGetter: (value) => value?.charAt(0).toUpperCase() + value?.slice(1) },
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

  const rows = (data?.data?.data || []).map((s) => ({ ...s, id: s._id }));

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Typography variant="h5">Manage Students</Typography>
        <Box className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Student</Button>
        </Box>
      </Box>

      <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={data?.data?.pagination?.total || 0}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-3">
            {error && <Alert severity="error">{error}</Alert>}
            <Controller name="name" control={control} render={({ field }) => (
              <TextField fullWidth label="Full Name" {...field} error={!!formErrors.name} helperText={formErrors.name?.message} />
            )} />
            <Controller name="email" control={control} render={({ field }) => (
              <TextField fullWidth label="Email" type="email" {...field} disabled={!!editStudent} error={!!formErrors.email} helperText={formErrors.email?.message} />
            )} />
            {!editStudent && (
              <Controller name="password" control={control} render={({ field }) => (
                <TextField fullWidth label="Password" type="password" {...field} error={!!formErrors.password} helperText={formErrors.password?.message} />
              )} />
            )}
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="rollNumber" control={control} render={({ field }) => (
                <TextField fullWidth label="Roll Number" {...field} error={!!formErrors.rollNumber} helperText={formErrors.rollNumber?.message} />
              )} />
              <Controller name="class" control={control} render={({ field }) => (
                <TextField fullWidth select label="Class" {...field} error={!!formErrors.class} helperText={formErrors.class?.message}>
                  {(classesData?.data?.data || []).map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name} - {c.section}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Box>
            <Box className="grid grid-cols-3 gap-3">
              <Controller name="section" control={control} render={({ field }) => (
                <TextField fullWidth select label="Section" {...field}>
                  {SECTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="gender" control={control} render={({ field }) => (
                <TextField fullWidth select label="Gender" {...field} error={!!formErrors.gender} helperText={formErrors.gender?.message}>
                  {GENDERS.map((g) => <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="dateOfBirth" control={control} render={({ field }) => (
                <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} {...field} error={!!formErrors.dateOfBirth} />
              )} />
            </Box>
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="parentName" control={control} render={({ field }) => (
                <TextField fullWidth label="Parent Name" {...field} error={!!formErrors.parentName} helperText={formErrors.parentName?.message} />
              )} />
              <Controller name="parentPhone" control={control} render={({ field }) => (
                <TextField fullWidth label="Parent Phone" {...field} error={!!formErrors.parentPhone} helperText={formErrors.parentPhone?.message} />
              )} />
            </Box>
            <Controller name="address" control={control} render={({ field }) => (
              <TextField fullWidth label="Address" multiline rows={2} {...field} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={adding || updating}>
              {editStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Delete Student" message="This will deactivate the student account. Continue?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
};

export default ManageStudents;
