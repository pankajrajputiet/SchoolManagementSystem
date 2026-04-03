import { Chip } from '@mui/material';

const colorMap = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
  active: 'success',
  inactive: 'default',
  admin: 'secondary',
  teacher: 'primary',
  student: 'info',
};

const StatusChip = ({ status }) => (
  <Chip
    label={status}
    color={colorMap[status?.toLowerCase()] || 'default'}
    size="small"
    sx={{ textTransform: 'capitalize' }}
  />
);

export default StatusChip;
