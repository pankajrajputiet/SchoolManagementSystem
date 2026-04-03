import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box className="flex flex-col items-center justify-center py-12 gap-3">
    <CircularProgress />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

export default LoadingSpinner;
