import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, MenuItem, TextField,
  Button, Alert, Chip, FormControl, InputLabel, Select,
  OutlinedInput, Chip as MuiChip, FormHelperText, Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  History as HistoryIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import {
  useSendSMSMutation,
  useGetSMSTemplatesQuery,
  useGetClassesForSMSQuery,
  useGetClassStudentsForSMSQuery,
} from './smsApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SMS_CATEGORIES = [
  { value: 'fees', label: 'Fee Reminder', color: 'warning' },
  { value: 'vacation', label: 'Vacation/Holiday', color: 'info' },
  { value: 'exam', label: 'Exam Notification', color: 'primary' },
  { value: 'absence', label: 'Student Absence', color: 'error' },
  { value: 'emergency', label: 'Emergency Alert', color: 'error' },
  { value: 'custom', label: 'Custom Message', color: 'default' },
];

const SendSMS = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: templatesData } = useGetSMSTemplatesQuery();
  const { data: classesData, isLoading: loadingClasses } = useGetClassesForSMSQuery();
  const { data: studentsData, isLoading: loadingStudents } = useGetClassStudentsForSMSQuery(targetClass, {
    skip: !targetClass,
  });
  const [sendSMS, { isLoading: sending }] = useSendSMSMutation();
console.log('Templates Data:', templatesData);
  const templates = templatesData?.data || {};
  const classes = classesData?.data?.data || [];
  const students = studentsData?.data?.students || [];

  // Reset selected students when class changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [targetClass]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSuccess('');
    setError('');
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const generatePreview = () => {
    if (!category) return '';

    const template = templates[category];
    if (!template) return customMessage;

    const sampleData = {
      parentName: 'Parent Name',
      studentName: 'Student Name',
      className: targetClass ? classes.find((c) => c._id === targetClass)?.name : 'Class',
      amount: '5000',
      dueDate: '2024-02-01',
      startDate: '2024-02-10',
      endDate: '2024-02-15',
      reopeningDate: '2024-02-16',
      reason: 'Annual Day Celebrations',
      examType: 'Mid-Term',
      absentDays: '3',
      message: customMessage,
      schoolName: 'School',
      schoolPhone: '+919876543210',
    };

    return template.sample || customMessage;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      if (!category) {
        setError('Please select a category');
        return;
      }

      if (category === 'custom' && !customMessage.trim()) {
        setError('Please enter a custom message');
        return;
      }

      if (!targetClass && selectedStudents.length === 0) {
        setError('Please select a class or specific students');
        return;
      }

      const payload = {
        category,
        targetClass: targetClass || undefined,
        studentIds: selectedStudents.length > 0 ? selectedStudents : undefined,
        metadata: {},
      };

      if (category === 'custom') {
        payload.message = customMessage;
      }

      if (scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }

      await sendSMS(payload).unwrap();
      setSuccess('SMS sent successfully!');
      setCategory('');
      setTargetClass('');
      setSelectedStudents([]);
      setCustomMessage('');
      setScheduledAt('');
    } catch (err) {
      setError(err?.data?.message || 'Failed to send SMS');
    }
  };

  if (loadingClasses) return <LoadingSpinner />;

  const selectedTemplate = templates[category];

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">Send SMS Notification</Typography>
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/admin/sms-history')}
          >
            SMS History
          </Button>
          <Button
            variant="outlined"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/admin/sms-stats')}
          >
            Statistics
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" className="mb-4">{success}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                1. Select Category
              </Typography>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SMS_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.value}
                    label={cat.label}
                    color={cat.color}
                    variant={category === cat.value ? 'filled' : 'outlined'}
                    onClick={() => handleCategoryChange(cat.value)}
                    sx={{ cursor: 'pointer', height: 40, fontSize: '0.875rem' }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                2. Select Recipients
              </Typography>

              <TextField
                select
                fullWidth
                label="Select Class"
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="mb-4"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section} ({cls.studentsCount || 0} students)
                  </MenuItem>
                ))}
              </TextField>

              {targetClass && loadingStudents && <LoadingSpinner />}

              {targetClass && !loadingStudents && students.length > 0 && (
                <Box>
                  <Box className="flex justify-between items-center mb-2">
                    <Typography variant="subtitle2" color="text.secondary">
                      Select Students ({selectedStudents.length}/{students.length} selected)
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleSelectAllStudents}
                    >
                      {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {students.map((student) => (
                      <Box
                        key={student._id}
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStudents.includes(student._id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleStudentToggle(student._id)}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {student.user?.name || student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Roll: {student.rollNumber} | Parent: {student.parentName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {student.parentPhone}
                        </Typography>
                      </Box>
                    ))}
                  </div>
                </Box>
              )}

              {targetClass && !loadingStudents && students.length === 0 && (
                <Alert severity="info">No students found in this class.</Alert>
              )}
            </CardContent>
          </Card>

          {/* Message */}
          {category === 'custom' && (
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  3. Compose Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  helperText={`${customMessage.length}/160 characters`}
                  inputProps={{ maxLength: 160 }}
                />
              </CardContent>
            </Card>
          )}

          {/* Schedule (Optional) */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                {category === 'custom' ? '4' : '3'}. Schedule (Optional)
              </Typography>
              <TextField
                fullWidth
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty to send immediately"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={sending}
            sx={{ py: 1.5 }}
          >
            {sending ? 'Sending...' : scheduledAt ? 'Schedule SMS' : 'Send SMS Now'}
          </Button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">
                SMS Preview
              </Typography>

              {category && selectedTemplate ? (
                <Box>
                  <Chip
                    label={SMS_CATEGORIES.find((c) => c.value === category)?.label}
                    color={SMS_CATEGORIES.find((c) => c.value === category)?.color}
                    size="small"
                    className="mb-3"
                  />

                  {category !== 'custom' && (
                    <>
                      <Typography variant="body2" className="mb-2" color="text.secondary">
                        Template Fields Required:
                      </Typography>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {selectedTemplate.requiredFields?.map((field) => (
                          <MuiChip
                            key={field}
                            label={field}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </div>
                      <Divider className="my-3" />
                    </>
                  )}

                  <Box className="bg-gray-50 p-3 rounded-lg">
                    <Typography variant="body2" className="whitespace-pre-wrap">
                      {generatePreview()}
                    </Typography>
                  </Box>

                  {targetClass && (
                    <Typography variant="caption" color="text.secondary" className="block mt-3">
                      Recipients: {selectedStudents.length > 0 ? selectedStudents.length : students.length} students
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a category to preview the SMS template
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Box>
  );
};

export default SendSMS;
