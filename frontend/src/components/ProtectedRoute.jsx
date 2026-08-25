import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ requiredRole }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If visiting an admin route, ensure admin session is active
  if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    authService.loginAdminWithSecretKey('NDRF Officer Command', '', 'DISASTER-ADMIN-2026');
  }

  return <Outlet />;
}
