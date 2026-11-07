import type { TaskPriority, TaskStatus } from '../types/index';

export const COLUMNS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: 'backlog', label: 'Backlog', dot: 'bg-slate-400' },
  { status: 'todo', label: 'To do', dot: 'bg-blue-500' },
  { status: 'in_progress', label: 'In progress', dot: 'bg-amber-500' },
  { status: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
];

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};