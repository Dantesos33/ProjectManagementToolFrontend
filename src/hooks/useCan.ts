import { useAppSelector } from './index';
import { atLeast } from '../lib/permissions';

// Mirrors the backend Policies. This only controls what the UI shows;
// Laravel enforces the real rules.
export function useCan() {
  const role = useAppSelector((state) => state.auth.user?.role);

  return {
    viewProjects: atLeast(role, 'viewer'),
    moveTask: atLeast(role, 'developer'),
    createProject: atLeast(role, 'manager'),
    editProject: atLeast(role, 'manager'),
    deleteProject: atLeast(role, 'manager'),
    createTask: atLeast(role, 'manager'),
    editTask: atLeast(role, 'manager'),
    deleteTask: atLeast(role, 'manager'),
    manageUsers: atLeast(role, 'admin'),
    viewAudit: atLeast(role, 'admin'),
  };
}