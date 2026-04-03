import { Box, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useGetMyStudentProfileQuery, useGetMyAssignmentsQuery } from './studentApiSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/formatters';
import dayjs from 'dayjs';

const ViewAssignments = () => {
  const { data: profileData } = useGetMyStudentProfileQuery();
  const student = profileData?.data;

  const { data, isLoading } = useGetMyAssignmentsQuery(
    { class: student?.class?._id, limit: 50 },
    { skip: !student?.class?._id }
  );

  if (!student || isLoading) return <LoadingSpinner />;

  const assignments = data?.data?.data || [];

  return (
    <Box>
      <Typography variant="h5" className="mb-6">My Assignments</Typography>

      {assignments.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => {
            const isOverdue = dayjs(a.dueDate).isBefore(dayjs());
            const mySubmission = a.submissions?.find(
              (s) => s.student === student._id || s.student?._id === student._id
            );

            return (
              <Card key={a._id}>
                <CardContent>
                  <Box className="flex justify-between items-start mb-2">
                    <Typography variant="h6">{a.title}</Typography>
                    {mySubmission ? (
                      <Chip label="Submitted" color="success" size="small" />
                    ) : isOverdue ? (
                      <Chip label="Overdue" color="error" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    {a.subject?.name} | Due: {formatDate(a.dueDate)}
                  </Typography>
                  {a.description && (
                    <Typography variant="body2" className="mb-2">{a.description}</Typography>
                  )}
                  {a.attachments?.length > 0 && (
                    <Box className="flex items-center gap-1 mb-2">
                      <AttachFileIcon fontSize="small" />
                      <Typography variant="caption">{a.attachments.length} attachment(s)</Typography>
                    </Box>
                  )}
                  {mySubmission?.grade !== undefined && (
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      Grade: {mySubmission.grade}
                      {mySubmission.feedback && ` - ${mySubmission.feedback}`}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" className="text-center py-8">
              No assignments yet.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ViewAssignments;
