import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectUserRole } from '@/features/auth/authSlice';

const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  return { user, isAuthenticated, role };
};

export default useAuth;
