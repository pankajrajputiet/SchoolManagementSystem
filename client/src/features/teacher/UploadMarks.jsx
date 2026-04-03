import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, TextField,
  Button, Alert,
} from '@mui/material';
import {
  useGetMyClassesQuery, useGetClassStudentsQuery,
  useUploadMarksBulkMutation, useGetSubjectsByClassQuery,
} from './teacherApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { EXAM_TYPES } from '@/utils/constants';

const UploadMarks = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [marks, setMarks] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data: classesData, isLoading: loadingClasses } = useGetMyClassesQuery();
  const { data: classDetail } = useGetClassStudentsQuery(selectedClass, { skip: !selectedClass });
  const { data: subjectsData } = useGetSubjectsByClassQuery({ class: selectedClass, limit: 50 }, { skip: !selectedClass });
  const [uploadMarks, { isLoading: uploading }] = useUploadMarksBulkMutation();

  const students = classDetail?.data?.students || [];
  const subjects = subjectsData?.data?.data || [];
  const classes = classesData?.data?.data || [];

  const handleMarksChange = (studentId, value) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      const records = Object.entries(marks).map(([student, marksObtained]) => ({
        student,
        marksObtained: Number(marksObtained),
      }));

      if (records.length === 0) {
        setError('Please enter marks for at least one student');
        return;
      }

      await uploadMarks({
        classId: selectedClass,
        subject: selectedSubject,
        examType,
        academicYear,
        totalMarks: Number(totalMarks),
        records,
      }).unwrap();
      setSuccess('Marks uploaded successfully!');
      setMarks({});
    } catch (err) {
      setError(err?.data?.message || 'Failed to upload marks');
    }
  };

  if (loadingClasses) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" className="mb-6">Upload Marks</Typography>

      <Card className="mb-4">
        <CardContent>
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField select fullWidth label="Select Class" value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(''); setMarks({}); }}>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name} - {cls.section}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Select Subject" value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
              {subjects.map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name} ({s.code})</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Exam Type" value={examType}
              onChange={(e) => setExamType(e.target.value)}>
              {EXAM_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Total Marks" type="number" value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)} />
            <TextField fullWidth label="Academic Year" value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)} />
          </Box>
        </CardContent>
      </Card>

      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {selectedClass && selectedSubject && examType && (
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Enter Marks</Typography>
            {students.length > 0 ? (
              <Box className="space-y-3">
                {students.map((student) => (
                  <Box key={student._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-4">
                    <Box className="flex-1">
                      <Typography fontWeight="medium">{student.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Roll: {student.rollNumber}</Typography>
                    </Box>
                    <TextField
                      size="small" label="Marks" type="number"
                      value={marks[student._id] || ''}
                      onChange={(e) => handleMarksChange(student._id, e.target.value)}
                      sx={{ width: 120 }}
                      inputProps={{ min: 0, max: totalMarks }}
                    />
                  </Box>
                ))}
                <Button variant="contained" fullWidth onClick={handleSubmit} disabled={uploading}>
                  {uploading ? 'Submitting...' : 'Submit Marks'}
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

export default UploadMarks;
