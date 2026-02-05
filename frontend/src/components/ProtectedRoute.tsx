import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({
  children,
  isAuthenticated,
  redirectPath = '/login'
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted URL
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;