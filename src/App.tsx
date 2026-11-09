import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import {
  GuestRoute,
  LoginPage,
  RegisterPage,
  ProtectedRoute,
  RoleRoute,
} from "./pages/auth/index";
import AuditLogPage from './pages/audit/AuditLogPage';
import { ProjectBoardPage, ProjectsPage } from "./pages/project/index";
import { useAppTheme } from "./hooks/index";
import AuthBootstrap from "./store/auth/AuthBootstrap";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import AcceptInvitePage from './pages/auth/AcceptInvitePage';
import TeamPage from './pages/team/TeamPage';

export default function App() {
  useAppTheme();

  return (
    <AuthBootstrap>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectBoardPage />} />

            <Route element={<RoleRoute allow={["admin"]} />}>
              <Route path="/admin/users" element={<TeamPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
            </Route>

            <Route
              path="/403"
              element={
                <Placeholder
                  title="403 · No access"
                  description="Your role doesn't allow you to view this page."
                  showHome
                />
              }
            />
            <Route
              path="*"
              element={
                <Placeholder
                  title="404 · Not found"
                  description="This page doesn't exist."
                  showHome
                />
              }
            />
          </Route>
        </Route>

        <Route path="/accept-invite" element={<AcceptInvitePage />} />
      </Routes>
    </AuthBootstrap>
  );
}
