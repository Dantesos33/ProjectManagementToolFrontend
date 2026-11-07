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