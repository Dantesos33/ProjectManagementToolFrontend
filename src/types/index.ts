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

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: number | null;
  assignee?: { id: number; name: string } | null;
  due_date: string | null;   // YYYY-MM-DD
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string | null;
  status?: TaskStatus;
  priority: TaskPriority;
  assigned_to: number | null;
  due_date: string | null;
}

export interface Member {
  id: number;
  name: string;
  role: Role;
}