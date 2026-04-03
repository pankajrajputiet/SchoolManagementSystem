import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useLoginMutation } from './authApiSlice';
import { setCredentials } from './authSlice';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      const res = await login(data).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      const role = res.data.user.role;
      
      // Map roles to their dashboard routes
      let dashboardPath;
      switch (role) {
        case 'superadmin':
          dashboardPath = '/superadmin/dashboard';
          break;
        case 'schooladmin':
        case 'admin':
          dashboardPath = '/admin/dashboard';
          break;
        case 'teacher':
          dashboardPath = '/teacher/dashboard';
          break;
        case 'student':
          dashboardPath = '/student/dashboard';
          break;
        default:
          dashboardPath = '/login';
      }
      
      navigate(dashboardPath);
    } catch (err) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent className="p-8">
          <Typography variant="h4" className="text-center mb-2" fontWeight="bold">
            School Management
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-center mb-6"
          >
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="caption" className="block text-center mt-4" color="text.secondary">
            Super Admin: superadmin@schoolmanagement.com / SuperAdmin@123
            <br />
            School Admin: admin@demosschool.com / SchoolAdmin@123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
