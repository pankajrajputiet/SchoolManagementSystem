import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
