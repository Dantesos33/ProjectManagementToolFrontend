import type { Role } from '../types';

const LEVEL: Record<Role, number> = { viewer: 1, developer: 2, manager: 3, admin: 4 };

export const atLeast = (role: Role | undefined, min: Role): boolean =>
  !!role && LEVEL[role] >= LEVEL[min];