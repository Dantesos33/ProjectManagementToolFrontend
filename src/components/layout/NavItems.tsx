import type { Role } from '../../types';
import type { IconName } from './Icons';

export interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  minRole?: Role;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: 'home' },
  { label: 'Projects', to: '/projects', icon: 'folder' },
  { label: 'Team', to: '/admin/users', icon: 'users', minRole: 'admin' },
  { label: 'Audit log', to: '/admin/audit', icon: 'shield', minRole: 'admin' },
];