import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath?: string;
  children: JSX.Element;
};

function ProtectedRoute({
  isAllowed,
  redirectPath = '/login',
  children,
}: ProtectedRouteProps) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;