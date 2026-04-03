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
  Avatar,
  Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Company Name */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
              variant="rounded"
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary">
              School Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Enterprise Portal
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
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

          {/* Demo Credentials */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <strong>Super Admin:</strong> superadmin@schoolmanagement.com / SuperAdmin@123
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              <strong>School Admin:</strong> admin@demosschool.com / SchoolAdmin@123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
