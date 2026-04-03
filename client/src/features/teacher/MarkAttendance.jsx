import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, TextField,
  Button, Checkbox, FormControlLabel, Alert, Chip,
} from '@mui/material';
import {
  useGetMyClassesQuery, useGetClassStudentsQuery, useMarkAttendanceBulkMutation,
} from './teacherApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ATTENDANCE_STATUS } from '@/utils/constants';
import dayjs from 'dayjs';

const MarkAttendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [records, setRecords] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data: classesData, isLoading: loadingClasses } = useGetMyClassesQuery();
  const { data: classDetail, isLoading: loadingStudents } = useGetClassStudentsQuery(selectedClass, { skip: !selectedClass });
  const [markAttendance, { isLoading: marking }] = useMarkAttendanceBulkMutation();

  const students = classDetail?.data?.students || [];

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const all = {};
    students.forEach((s) => { all[s._id] = status; });
    setRecords(all);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      const attendanceRecords = Object.entries(records).map(([student, status]) => ({
        student, status,
      }));

      if (attendanceRecords.length === 0) {
        setError('Please mark attendance for at least one student');
        return;
      }

      await markAttendance({ classId: selectedClass, date, records: attendanceRecords }).unwrap();
      setSuccess('Attendance marked successfully!');
    } catch (err) {
      setError(err?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loadingClasses) return <LoadingSpinner />;

  const classes = classesData?.data?.data || [];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">Mark Attendance</Typography>

      <Card className="mb-4">
        <CardContent>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              select fullWidth label="Select Class" value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setRecords({}); }}
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name} - {cls.section}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </CardContent>
      </Card>

      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {selectedClass && (
        <Card>
          <CardContent>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">Students ({students.length})</Typography>
              <Box className="flex gap-2">
                <Button size="small" variant="outlined" color="success" onClick={() => handleMarkAll('present')}>All Present</Button>
                <Button size="small" variant="outlined" color="error" onClick={() => handleMarkAll('absent')}>All Absent</Button>
              </Box>
            </Box>

            {loadingStudents ? (
              <LoadingSpinner />
            ) : students.length > 0 ? (
              <Box className="space-y-2">
                {students.map((student) => (
                  <Box key={student._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <Box>
                      <Typography fontWeight="medium">{student.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Roll: {student.rollNumber}
                      </Typography>
                    </Box>
                    <Box className="flex gap-1">
                      {Object.values(ATTENDANCE_STATUS).map((status) => (
                        <Chip
                          key={status} label={status} size="small"
                          color={records[student._id] === status ? (status === 'present' ? 'success' : status === 'absent' ? 'error' : 'warning') : 'default'}
                          variant={records[student._id] === status ? 'filled' : 'outlined'}
                          onClick={() => handleStatusChange(student._id, status)}
                          sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}

                <Button
                  variant="contained" fullWidth className="mt-4"
                  onClick={handleSubmit} disabled={marking}
                >
                  {marking ? 'Submitting...' : 'Submit Attendance'}
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary">No students in this class.</Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MarkAttendance;
