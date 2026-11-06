// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { GuestRoute, LoginPage, RegisterPage, ProtectedRoute, RoleRoute } from './pages/auth/index';
import { useAppTheme } from './hooks/index';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';

export default function App() {
  useAppTheme();

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects"
                 element={<Placeholder title="Projects" description="Your projects and Kanban boards will live here." />} />

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin/users"
                   element={<Placeholder title="Team" description="Invite members and manage roles." />} />
            <Route path="/admin/audit"
                   element={<Placeholder title="Audit log" description="Workspace activity will appear here." />} />
          </Route>

          <Route path="/403"
                 element={<Placeholder title="403 · No access" description="Your role doesn't allow you to view this page." showHome />} />
          <Route path="*"
                 element={<Placeholder title="404 · Not found" description="This page doesn't exist." showHome />} />
        </Route>
      </Route>
    </Routes>
  );
}