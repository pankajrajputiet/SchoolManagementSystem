import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/features/auth/LoginPage';
import AdminDashboard from '@/features/admin/AdminDashboard';
import ManageStudents from '@/features/admin/ManageStudents';
import ManageTeachers from '@/features/admin/ManageTeachers';
import ManageClasses from '@/features/admin/ManageClasses';
import Reports from '@/features/admin/Reports';
import TeacherDashboard from '@/features/teacher/TeacherDashboard';
import MarkAttendance from '@/features/teacher/MarkAttendance';
import UploadMarks from '@/features/teacher/UploadMarks';
import ViewClasses from '@/features/teacher/ViewClasses';
import TeacherAssignments from '@/features/teacher/Assignments';
import StudentDashboard from '@/features/student/StudentDashboard';
import ViewAttendance from '@/features/student/ViewAttendance';
import ViewMarks from '@/features/student/ViewMarks';
import StudentProfile from '@/features/student/StudentProfile';
import StudentAssignments from '@/features/student/ViewAssignments';
import { ROLES } from '@/utils/constants';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Typography variant="h4">403 - Unauthorized</Typography>
      <Typography color="text.secondary">
        You do not have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Box>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Typography variant="h4">404 - Page Not Found</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Admin routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/teachers" element={<ManageTeachers />} />
            <Route path="/admin/classes" element={<ManageClasses />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/attendance" element={<MarkAttendance />} />
            <Route path="/teacher/marks" element={<UploadMarks />} />
            <Route path="/teacher/classes" element={<ViewClasses />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          </Route>

          {/* Student routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<ViewAttendance />} />
            <Route path="/student/marks" element={<ViewMarks />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
          </Route>
        </Route>
      </Route>

      {/* Redirects & catch-all */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
