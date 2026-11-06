import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/index';

// Logged-in users shouldn't see login/register
export default function GuestRoute() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Navigate to="/" replace /> : <Outlet />;
}