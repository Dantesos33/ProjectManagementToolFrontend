import { Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute, LoginPage, RegisterPage } from './pages/auth/index';
import Dashboard from './pages/Dashboard';
import { useAppTheme } from './hooks/index';

export default function App() {
  useAppTheme();
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}