import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useDropzone } from 'react-dropzone';
import {
  useGetTeacherAssignmentsQuery, useCreateAssignmentMutation,
  useGetMyClassesQuery, useGetSubjectsByClassQuery,
} from './teacherApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/formatters';

const Assignments = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', subject: '', class: '', dueDate: '' });
  const [files, setFiles] = useState([]);

  const { data, isLoading } = useGetTeacherAssignmentsQuery({ limit: 50 });
  const { data: classesData } = useGetMyClassesQuery();
  const { data: subjectsData } = useGetSubjectsByClassQuery(
    { class: selectedClass, limit: 50 },
    { skip: !selectedClass }
  );
  const [createAssignment, { isLoading: creating }] = useCreateAssignmentMutation();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted]),
    maxFiles: 5,
  });

  const assignments = data?.data?.data || [];
  const classes = classesData?.data?.data || [];
  const subjects = subjectsData?.data?.data || [];

  const handleSubmit = async () => {
    try {
      setError('');
      await createAssignment({ ...formData, files }).unwrap();
      setSuccess('Assignment created!');
      setFormOpen(false);
      setFormData({ title: '', description: '', subject: '', class: '', dueDate: '' });
      setFiles([]);
    } catch (err) {
      setError(err?.data?.message || 'Failed to create assignment');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">Assignments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Assignment
        </Button>
      </Box>

      {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>{success}</Alert>}

      {assignments.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <Card key={a._id}>
              <CardContent>
                <Typography variant="h6">{a.title}</Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {a.subject?.name} | {a.class?.name} {a.class?.section}
                </Typography>
                <Typography variant="body2" className="mb-2">{a.description}</Typography>
                <Box className="flex justify-between items-center">
                  <Typography variant="caption" color="text.secondary">
                    Due: {formatDate(a.dueDate)}
                  </Typography>
                  {a.attachments?.length > 0 && (
                    <Box className="flex items-center gap-1">
                      <AttachFileIcon fontSize="small" />
                      <Typography variant="caption">{a.attachments.length} files</Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="primary">
                  {a.submissions?.length || 0} submissions
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card><CardContent><Typography color="text.secondary" className="text-center py-8">No assignments yet.</Typography></CardContent></Card>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent className="space-y-3">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField fullWidth label="Title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <TextField fullWidth label="Description" multiline rows={3} value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <TextField select fullWidth label="Class" value={formData.class}
            onChange={(e) => { setFormData({ ...formData, class: e.target.value, subject: '' }); setSelectedClass(e.target.value); }}>
            {classes.map((c) => <MenuItem key={c._id} value={c._id}>{c.name} - {c.section}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Subject" value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })} disabled={!formData.class}>
            {subjects.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }}
            value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
          <Box {...getRootProps()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
            <input {...getInputProps()} />
            <Typography color="text.secondary">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Drop files here or click to upload'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={creating}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments;
