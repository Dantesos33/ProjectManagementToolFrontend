import type { Task } from '../types/index';

/**
 * `column` is the destination column sorted by position, WITHOUT the card being moved.
 * `index` is where the card lands in it.
 */
export function computePosition(column: Task[], index: number): number {
  const before = column[index - 1]?.position;
  const after = column[index]?.position;

  if (before === undefined && after === undefined) return 1;   // empty column
  if (before === undefined) return (after as number) / 2;       // dropped at the top
  if (after === undefined) return before + 1;                   // dropped at the bottom
  return (before + after) / 2;                                  // between two cards
}