export type Role = 'viewer' | 'developer' | 'manager' | 'admin';

export interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthPayload {
  token: string;
  expires_in: number;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  tasks_count?: number;   // present on list and show, absent right after create
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface DashboardStats {
  projects: number;
  open_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}

export interface ProjectInput {
  name: string;
  description: string | null;
}