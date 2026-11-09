import type { Role } from '../types';

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view projects and tasks.' },
  { value: 'developer', label: 'Developer', description: 'Can also move tasks between columns.' },
  { value: 'manager', label: 'Manager', description: 'Can also create, edit and delete projects and tasks.' },
  { value: 'admin', label: 'Admin', description: 'Full control, including team members and the audit log.' },
];

export const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  developer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};