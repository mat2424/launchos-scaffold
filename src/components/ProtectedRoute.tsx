import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    logger.debug('Auth state loading, showing spinner', 'ProtectedRoute');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    logger.info('User not authenticated, redirecting to login', 'ProtectedRoute');
    return <Navigate to="/login" replace />;
  }

  logger.debug(`User authenticated: ${user.email}`, 'ProtectedRoute');
  return <>{children}</>;
};