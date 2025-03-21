import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  isAllowed: boolean;
  requireDoctor?: boolean;
  redirectPath?: string;
  children: JSX.Element;
};

function ProtectedRoute({
  isAllowed,
  requireDoctor = false,
  redirectPath = '/login',
  children,
}: ProtectedRouteProps) {
  // Not authenticated
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Check if doctor access is required
  if (requireDoctor) {
    const { doctorId } = useAuth();
    // If no doctorId, user doesn't have doctor access
    if (!doctorId) {
      return <Navigate to="/upgrade-status?role=doctor" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;