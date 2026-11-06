import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/index';
import type { Role } from '../../types';

export default function RoleRoute({ allow }: { allow: Role[] }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return null;
  return allow.includes(user.role) ? <Outlet /> : <Navigate to="/403" replace />;
}