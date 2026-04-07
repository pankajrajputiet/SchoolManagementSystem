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
import {
  useGetClassesQuery, useAddClassMutation,
  useUpdateClassMutation, useDeleteClassMutation, useGetTeachersQuery,
} from './adminApiSlice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SECTIONS } from '@/utils/constants';

const ManageClasses = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useGetClassesQuery({ page: page + 1, limit: pageSize });
  const { data: teachersData } = useGetTeachersQuery({ limit: 100 });
  const [addClass, { isLoading: adding }] = useAddClassMutation();
  const [updateClass, { isLoading: updating }] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm();

  const openAdd = () => {
    setEditClass(null);
    reset({ name: '', section: 'A', academicYear: '2026-2027', maxStrength: 40, classTeacher: '' });
    setFormOpen(true);
  };

  const openEdit = (cls) => {
    setEditClass(cls);
    reset({
      name: cls.name, section: cls.section, academicYear: cls.academicYear,
      maxStrength: cls.maxStrength, classTeacher: cls.classTeacher?._id || '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      setError('');
      const payload = { ...formData };
      if (!payload.classTeacher) delete payload.classTeacher;
      if (editClass) {
        await updateClass({ id: editClass._id, ...payload }).unwrap();
      } else {
        await addClass(payload).unwrap();
      }
      setFormOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    await deleteClass(deleteId).unwrap();
    setDeleteId(null);
  };

  const columns = [
    { field: 'name', headerName: 'Class Name', flex: 1 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'academicYear', headerName: 'Academic Year', width: 130 },
    { field: 'teacher', headerName: 'Class Teacher', flex: 1, valueGetter: (value, row) => row.classTeacher?.user?.name || 'Not Assigned' },
    { field: 'students', headerName: 'Students', width: 100, valueGetter: (value, row) => row.students?.length || 0 },
    { field: 'maxStrength', headerName: 'Max', width: 80 },
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

  const rows = (data?.data?.data || []).map((c) => ({ ...c, id: c._id }));

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Typography variant="h5">Manage Classes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Class</Button>
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
        <DialogTitle>{editClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-3">
            {error && <Alert severity="error">{error}</Alert>}
            <Controller name="name" control={control} rules={{ required: 'Required' }} render={({ field }) => (
              <TextField fullWidth label="Class Name" placeholder="e.g. 10th Grade" {...field} error={!!formErrors.name} helperText={formErrors.name?.message} />
            )} />
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="section" control={control} render={({ field }) => (
                <TextField fullWidth select label="Section" {...field}>
                  {SECTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="academicYear" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                <TextField fullWidth label="Academic Year" placeholder="2026-2027" {...field} />
              )} />
            </Box>
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="maxStrength" control={control} render={({ field }) => (
                <TextField fullWidth label="Max Strength" type="number" {...field} />
              )} />
              <Controller name="classTeacher" control={control} render={({ field }) => (
                <TextField fullWidth select label="Class Teacher" {...field}>
                  <MenuItem value="">None</MenuItem>
                  {(teachersData?.data?.data || []).map((t) => (
                    <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={adding || updating}>
              {editClass ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Delete Class" message="Are you sure you want to delete this class?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
};

export default ManageClasses;
