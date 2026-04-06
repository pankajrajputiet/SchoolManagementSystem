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
  useGetSubjectsQuery, useAddSubjectMutation,
  useUpdateSubjectMutation, useDeleteSubjectMutation,
  useGetClassesQuery, useGetTeachersQuery,
} from './adminApiSlice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SUBJECT_TYPES } from '@/utils/constants';

const subjectTypeOptions = Object.values(SUBJECT_TYPES).map(type => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}));

const ManageSubjects = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useGetSubjectsQuery({ page: page + 1, limit: pageSize });
  const { data: classesData } = useGetClassesQuery({ limit: 100 });
  const { data: teachersData } = useGetTeachersQuery({ limit: 100 });
  const [addSubject, { isLoading: adding }] = useAddSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      class: '',
      teacher: '',
      type: SUBJECT_TYPES.THEORY,
    },
  });

  const openAdd = () => {
    setEditSubject(null);
    reset({ name: '', code: '', class: '', teacher: '', type: SUBJECT_TYPES.THEORY });
    setFormOpen(true);
  };

  const openEdit = (subject) => {
    setEditSubject(subject);
    reset({
      name: subject.name,
      code: subject.code,
      class: subject.class?._id || subject.class,
      teacher: subject.teacher?._id || '',
      type: subject.type,
    });
    setFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      setError('');
      const payload = { ...formData };
      payload.code = payload.code.toUpperCase();
      if (!payload.teacher) delete payload.teacher;
      if (editSubject) {
        await updateSubject({ id: editSubject._id, ...payload }).unwrap();
      } else {
        await addSubject(payload).unwrap();
      }
      setFormOpen(false);
    } catch (err) {
      setError(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    await deleteSubject(deleteId).unwrap();
    setDeleteId(null);
  };

  const columns = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Subject Name', flex: 1 },
    { field: 'className', headerName: 'Class', width: 150, valueGetter: (value, row) => `${row.class?.name} - ${row.class?.section}` },
    { field: 'teacherName', headerName: 'Teacher', width: 150, valueGetter: (value, row) => row.teacher?.user?.name || 'Unassigned' },
    { field: 'type', headerName: 'Type', width: 120, valueGetter: (value) => value?.charAt(0).toUpperCase() + value?.slice(1) },
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
        <Typography variant="h5">Manage Subjects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Subject</Button>
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
        <DialogTitle>{editSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-3">
            {error && <Alert severity="error">{error}</Alert>}
            <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field }) => (
              <TextField fullWidth label="Subject Name" placeholder="e.g. Mathematics" {...field} error={!!formErrors.name} helperText={formErrors.name?.message} />
            )} />
            <Controller name="code" control={control} rules={{ required: 'Code is required' }} render={({ field }) => (
              <TextField fullWidth label="Subject Code" placeholder="e.g. MAT101" {...field} error={!!formErrors.code} helperText={formErrors.code?.message} />
            )} />
            <Box className="grid grid-cols-2 gap-3">
              <Controller name="class" control={control} rules={{ required: 'Class is required' }} render={({ field }) => (
                <TextField fullWidth select label="Class" {...field} error={!!formErrors.class} helperText={formErrors.class?.message}>
                  {(classesData?.data?.data || []).map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name} - {c.section}</MenuItem>
                  ))}
                </TextField>
              )} />
              <Controller name="teacher" control={control} render={({ field }) => (
                <TextField fullWidth select label="Teacher" {...field}>
                  <MenuItem value="">None</MenuItem>
                  {(teachersData?.data?.data || []).map((t) => (
                    <MenuItem key={t._id} value={t._id}>{t.user?.name}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Box>
            <Controller name="type" control={control} render={({ field }) => (
              <TextField fullWidth select label="Subject Type" {...field}>
                {subjectTypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={adding || updating}>
              {editSubject ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Delete Subject" message="Are you sure you want to delete this subject?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </Box>
  );
};

export default ManageSubjects;
