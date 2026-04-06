import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradingIcon from '@mui/icons-material/Grading';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import SmsIcon from '@mui/icons-material/Sms';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import useAuth from '@/hooks/useAuth';
import { ROLES } from '@/utils/constants';
import axiosInstance from '@/api/axiosInstance';

const DRAWER_WIDTH = 260;

const superAdminNav = [
  { label: 'Dashboard', path: '/superadmin/dashboard', icon: <DashboardIcon /> },
  { label: 'Schools', path: '/superadmin/schools', icon: <SchoolIcon /> },
  { label: 'Users', path: '/superadmin/users', icon: <PeopleIcon /> },
  { label: 'Reports', path: '/superadmin/reports', icon: <AssessmentIcon /> },
  { label: 'Settings', path: '/superadmin/settings', icon: <SettingsIcon /> },
];

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Students', path: '/admin/students', icon: <PeopleIcon /> },
  { label: 'Teachers', path: '/admin/teachers', icon: <SchoolIcon /> },
  { label: 'Classes', path: '/admin/classes', icon: <ClassIcon /> },
  { label: 'Subjects', path: '/admin/subjects', icon: <MenuBookIcon /> },
  { label: 'Fees', path: '/admin/fees', icon: <PaymentsIcon /> },
  { label: 'Salary', path: '/admin/salary', icon: <AccountBalanceWalletIcon /> },
  { label: 'Salary Structure', path: '/admin/salary-structure', icon: <AssessmentIcon /> },
  { label: 'Reports', path: '/admin/reports', icon: <AssessmentIcon /> },
  { label: 'Send SMS', path: '/admin/sms', icon: <SmsIcon /> },
  { label: 'SMS History', path: '/admin/sms-history', icon: <HistoryIcon /> },
  { label: 'SMS Status', path: '/admin/sms-stats', icon: <BarChartIcon /> },
];

const teacherNav = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: <DashboardIcon /> },
  { label: 'Attendance', path: '/teacher/attendance', icon: <EventNoteIcon /> },
  { label: 'Marks', path: '/teacher/marks', icon: <GradingIcon /> },
  { label: 'My Classes', path: '/teacher/classes', icon: <ClassIcon /> },
  { label: 'Assignments', path: '/teacher/assignments', icon: <AssignmentIcon /> },
  { label: 'Send SMS', path: '/teacher/sms', icon: <SmsIcon /> },
];

const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardIcon /> },
  { label: 'Attendance', path: '/student/attendance', icon: <EventNoteIcon /> },
  { label: 'Marks', path: '/student/marks', icon: <GradingIcon /> },
  { label: 'Assignments', path: '/student/assignments', icon: <AssignmentIcon /> },
  { label: 'Profile', path: '/student/profile', icon: <PersonIcon /> },
];

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const { role, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [schoolInfo, setSchoolInfo] = useState(null);

  // Fetch school info for non-super-admin users
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (role === ROLES.SUPER_ADMIN) {
        setSchoolInfo(null);
        return;
      }

      if (user?.schoolId) {
        try {
          const response = await axiosInstance.get(`/schools/${user.schoolId}`);
          const schoolData = response.data.data || response.data.message;
          setSchoolInfo(schoolData);
        } catch (err) {
          console.error('Failed to fetch school info:', err);
        }
      }
    };

    fetchSchoolInfo();
  }, [role, user]);

  const getNavItems = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return superAdminNav;
      case ROLES.ADMIN:
      case ROLES.SCHOOL_ADMIN:
        return adminNav;
      case ROLES.TEACHER:
        return teacherNav;
      case ROLES.STUDENT:
        return studentNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Render school logo and name header
  const renderSchoolHeader = () => {
    if (role === ROLES.SUPER_ADMIN) {
      return (
        <Box className="text-center py-3 px-2 bg-gradient-to-r from-blue-600 to-indigo-600">
          <Avatar
            sx={{ 
              width: 48, 
              height: 48, 
              mx: 'auto', 
              mb: 1, 
              bgcolor: 'white',
              color: 'primary.main'
            }}
          >
            <SchoolIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Typography 
            variant="subtitle1" 
            className="font-bold text-white"
            noWrap
          >
            School Management
          </Typography>
          <Typography variant="caption" className="text-blue-100">
            Super Admin Portal
          </Typography>
        </Box>
      );
    }

    // School-specific header with logo
    return (
      <Box className="text-center py-3 px-2 bg-gradient-to-r from-blue-600 to-indigo-600">
        {schoolInfo?.logo ? (
          <Avatar
            sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }}
            src={schoolInfo.logo}
            variant="rounded"
          />
        ) : (
          <Avatar
            sx={{ 
              width: 48, 
              height: 48, 
              mx: 'auto', 
              mb: 1, 
              bgcolor: 'white',
              color: 'primary.main'
            }}
            variant="rounded"
          >
            <SchoolIcon sx={{ fontSize: 28 }} />
          </Avatar>
        )}
        <Typography 
          variant="subtitle1" 
          className="font-bold text-white"
          noWrap
        >
          {schoolInfo?.name || 'School'}
        </Typography>
        {schoolInfo?.code && (
          <Typography variant="caption" className="text-blue-100">
            {schoolInfo.code}
          </Typography>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box>
      {renderSchoolHeader()}
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (variant === 'temporary') onClose?.();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
