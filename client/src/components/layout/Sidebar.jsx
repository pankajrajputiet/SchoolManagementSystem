import { useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradingIcon from '@mui/icons-material/Grading';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SmsIcon from '@mui/icons-material/Sms';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import useAuth from '@/hooks/useAuth';
import { ROLES } from '@/utils/constants';

const DRAWER_WIDTH = 240;

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
  { label: 'Reports', path: '/admin/reports', icon: <AssessmentIcon /> },
  { label: 'Send SMS', path: '/admin/sms', icon: <SmsIcon /> },
  { label: 'SMS History', path: '/admin/sms-history', icon: <HistoryIcon /> },
  { label: 'SMS Stats', path: '/admin/sms-stats', icon: <BarChartIcon /> },
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
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap className="font-bold text-blue-800">
          SMS
        </Typography>
      </Toolbar>
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
