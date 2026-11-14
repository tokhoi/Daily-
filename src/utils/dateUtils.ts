import type { Task, TaskLog } from '../types/habit';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** ISO weekday: 1 (Mon) .. 7 (Sun) */
export function getIsoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function formatShortDate(key: string): string {
  const date = parseDateKey(key);
  const todayKey = toDateKey(new Date());
  const yesterdayKey = toDateKey(addDays(new Date(), -1));
  const tomorrowKey = toDateKey(addDays(new Date(), 1));

  if (key === todayKey) return 'Hôm nay';
  if (key === yesterdayKey) return 'Hôm qua';
  if (key === tomorrowKey) return 'Ngày mai';

  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${weekdays[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
}

export function getWeekDates(anchorDate: Date): string[] {
  const isoDay = getIsoWeekday(anchorDate);
  const monday = addDays(anchorDate, -(isoDay - 1));
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
}

export function getMonthCalendarDays(year: number, monthIndex: number): (string | null)[] {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = getIsoWeekday(firstDay) - 1; // 0 for Mon

  const cells: (string | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateKey(new Date(year, monthIndex, d)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/**
 * Generates 52 columns x 7 rows (Mon..Sun) ending in the current year's week or full year
 */
export function getYearHeatmapGrid(year: number): (string | null)[][] {
  const jan1 = new Date(year, 0, 1);
  const startOffset = getIsoWeekday(jan1) - 1;
  const gridStart = addDays(jan1, -startOffset);

  const columns: (string | null)[][] = [];
  for (let w = 0; w < 53; w++) {
    const col: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = addDays(gridStart, w * 7 + d);
      if (cellDate.getFullYear() === year) {
        col.push(toDateKey(cellDate));
      } else {
        col.push(null);
      }
    }
    columns.push(col);
  }
  return columns;
}

export function isTaskScheduledForDate(task: Task, dateKey: string): boolean {
  if (!task || !task.id) return false;

  if (task.archived_at) {
    const archivedDate = String(task.archived_at).slice(0, 10);
    if (dateKey >= archivedDate) return false;
  }

  if (task.created_at) {
    const createdDate = String(task.created_at).slice(0, 10);
    if (dateKey < createdDate) return false;
  }

  if (!task.is_recurring) {
    return String(task.target_date || '').slice(0, 10) === dateKey;
  }

  if (!task.recurrence_days || task.recurrence_days.length === 0) {
    return true;
  }
  const isoDay = getIsoWeekday(parseDateKey(dateKey));
  return task.recurrence_days.includes(isoDay);
}

export function getLogCompletionRatio(task: Task, log?: TaskLog): number {
  if (!log) return 0;
  if (log.status === 'skipped') return 1;
  const target = log.target_snapshot || task.target_value || 1;
  if (target <= 0) return log.value > 0 ? 1 : 0;
  return Math.min(1, log.value / target);
}
