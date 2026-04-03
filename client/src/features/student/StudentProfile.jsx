import { Box, Typography, Card, CardContent, TextField, Button, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useGetMyStudentProfileQuery } from './studentApiSlice';
import { useUpdateMeMutation } from '@/features/auth/authApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useState } from 'react';

const StudentProfile = () => {
  const { data, isLoading } = useGetMyStudentProfileQuery();
  const [updateMe, { isLoading: updating }] = useUpdateMeMutation();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const student = data?.data;

  const { register, handleSubmit } = useForm({
    values: {
      name: student?.user?.name || '',
      phone: student?.user?.phone || '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      setError('');
      await updateMe(formData).unwrap();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err?.data?.message || 'Update failed');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" className="mb-6">My Profile</Typography>

      {success && <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Edit Profile</Typography>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <TextField fullWidth label="Full Name" {...register('name')} />
              <TextField fullWidth label="Phone" {...register('phone')} />
              <TextField fullWidth label="Email" value={student?.user?.email || ''} disabled />
              <Button type="submit" variant="contained" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Student Information</Typography>
            <Box className="space-y-3">
              {[
                { label: 'Roll Number', value: student?.rollNumber },
                { label: 'Class', value: `${student?.class?.name} - ${student?.section}` },
                { label: 'Gender', value: student?.gender },
                { label: 'Date of Birth', value: student?.dateOfBirth?.slice(0, 10) },
                { label: 'Parent Name', value: student?.parentName },
                { label: 'Parent Phone', value: student?.parentPhone },
                { label: 'Blood Group', value: student?.bloodGroup || 'N/A' },
                { label: 'Address', value: student?.address || 'N/A' },
              ].map((item) => (
                <Box key={item.label} className="p-3 bg-gray-50 rounded-lg">
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography className="capitalize">{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StudentProfile;
