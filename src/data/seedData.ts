import type { Task, TaskLog } from '../types/habit';
import { addDays, toDateKey } from '../utils/dateUtils';

export const TASK_COLORS = [
  { name: 'Pastel Pink', hex: '#F472B6' },
  { name: 'Deep Blue', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Rose', hex: '#FB7185' },
  { name: 'Mint', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
];

export const ICON_PRESETS = [
  'water_drop',
  'wb_sunny',
  'menu_book',
  'directions_walk',
  'school',
  'self_improvement',
  'fitness_center',
  'edit_note',
  'restaurant',
  'laptop_mac',
  'bedtime',
  'flag',
];

export function createSeedData(): { tasks: Task[]; logs: TaskLog[] } {
  const today = new Date();
  const createdBase = toDateKey(addDays(today, -30)) + 'T00:00:00.000Z';
  const todayKey = toDateKey(today);

  const tasks: Task[] = [
    {
      id: 'task-water',
      title: 'Uống đủ nước',
      emoji: 'water_drop',
      color: '#EC4899',
      is_recurring: true,
      recurrence_days: [1, 2, 3, 4, 5, 6, 7],
      target_date: null,
      target_type: 'count',
      target_value: 8,
      target_period: 'day',
      unit: 'ly',
      created_at: createdBase,
      archived_at: null,
    },
    {
      id: 'task-wake',
      title: 'Dậy sớm trước 6h30',
      emoji: 'wb_sunny',
      color: '#F59E0B',
      is_recurring: true,
      recurrence_days: [1, 2, 3, 4, 5, 6, 7],
      target_date: null,
      target_type: 'boolean',
      target_value: 1,
      target_period: 'day',
      unit: 'lần',
      created_at: createdBase,
      archived_at: null,
    },
    {
      id: 'task-read',
      title: 'Đọc sách',
      emoji: 'menu_book',
      color: '#F43F5E',
      is_recurring: true,
      recurrence_days: [1, 2, 3, 4, 5, 6, 7],
      target_date: null,
      target_type: 'count',
      target_value: 20,
      target_period: 'day',
      unit: 'trang',
      created_at: createdBase,
      archived_at: null,
    },
    {
      id: 'task-steps',
      title: 'Đi bộ / Vận động',
      emoji: 'directions_walk',
      color: '#10B981',
      is_recurring: true,
      recurrence_days: [1, 2, 3, 4, 5],
      target_date: null,
      target_type: 'boolean',
      target_value: 1,
      target_period: 'day',
      unit: 'lần',
      created_at: createdBase,
      archived_at: null,
    },
    {
      id: 'task-study',
      title: 'Học kỹ năng mới',
      emoji: 'school',
      color: '#9333EA',
      is_recurring: true,
      recurrence_days: [1, 2, 3, 4, 5, 6, 7],
      target_date: null,
      target_type: 'count',
      target_value: 2,
      target_period: 'day',
      unit: 'giờ',
      created_at: createdBase,
      archived_at: null,
    },
    {
      id: 'task-adhoc-1',
      title: 'Dọn dẹp bàn làm việc',
      emoji: 'flag',
      color: '#6366F1',
      is_recurring: false,
      recurrence_days: [],
      target_date: todayKey,
      target_type: 'boolean',
      target_value: 1,
      target_period: 'day',
      unit: 'lần',
      created_at: todayKey + 'T00:00:00.000Z',
      archived_at: null,
    },
  ];

  const logs: TaskLog[] = [];
  for (let offset = 1; offset <= 21; offset++) {
    const dKey = toDateKey(addDays(today, -offset));
    tasks.forEach((task, idx) => {
      if (!task.is_recurring) return;
      const seed = (offset * 7 + idx * 3) % 10;
      if (seed < 2) return;
      const ratio = seed < 4 ? 0.5 : 1;
      const val =
        task.target_type === 'boolean'
          ? 1
          : Math.max(1, Math.round(task.target_value * ratio));
      logs.push({
        id: `${task.id}_${dKey}`,
        task_id: task.id,
        log_date: dKey,
        value: val,
        target_snapshot: task.target_value,
        status: val >= task.target_value ? 'completed' : 'partial',
        updated_at: new Date().toISOString(),
      });
    });
  }

  return { tasks, logs };
}
