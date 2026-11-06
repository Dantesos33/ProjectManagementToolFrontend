import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/index';

export default function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}