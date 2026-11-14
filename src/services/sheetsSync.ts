import type { DailyNote, Task, TaskLog } from '../types/habit';

const STORAGE_KEYS = {
  TASKS: 'daily_miniapp_tasks_v1',
  LOGS: 'daily_miniapp_logs_v1',
  DAILY_NOTES: 'daily_miniapp_daily_notes_v1',
  SHEET_URL: 'daily_miniapp_sheet_url_v1',
};

export function loadDailyNotes(): Record<string, DailyNote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES);
    return raw ? (JSON.parse(raw) as Record<string, DailyNote>) : {};
  } catch {
    return {};
  }
}

export function saveDailyNotes(notes: Record<string, DailyNote>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export function loadLocalData(): { tasks: Task[]; logs: TaskLog[] } | null {
  try {
    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!rawTasks) return null;
    return {
      tasks: JSON.parse(rawTasks) as Task[],
      logs: rawLogs ? (JSON.parse(rawLogs) as TaskLog[]) : [],
    };
  } catch {
    return null;
  }
}

export function saveLocalData(tasks: Task[], logs: TaskLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save local data', e);
  }
}

export function getSavedSheetUrl(): string {
  return localStorage.getItem(STORAGE_KEYS.SHEET_URL) || '';
}

export function saveSheetUrl(url: string): void {
  localStorage.setItem(STORAGE_KEYS.SHEET_URL, url.trim());
}

function normalizeDateField(val: unknown): string {
  if (!val) return '';
  const str = String(val);
  // Handle ISO string from Google Sheets Date cell
  if (str.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return str;
}

export async function fetchFromSheets(
  scriptUrl: string
): Promise<{ tasks: Task[]; logs: TaskLog[] }> {
  const res = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Sync failed');

  const rawTasks = Array.isArray(data.tasks) ? data.tasks : [];
  const rawLogs = Array.isArray(data.logs) ? data.logs : [];

  const tasks: Task[] = rawTasks
    .filter((t: Partial<Task>) => t && t.id && t.title)
    .map((t: Partial<Task>) => ({
      id: String(t.id),
      title: String(t.title),
      emoji: t.emoji ? String(t.emoji) : 'flag',
      color: t.color ? String(t.color) : '#EC4899',
      is_recurring: Boolean(t.is_recurring),
      recurrence_days: Array.isArray(t.recurrence_days) ? t.recurrence_days : [],
      target_date: t.target_date ? normalizeDateField(t.target_date) : null,
      target_type: t.target_type === 'count' ? 'count' : 'boolean',
      target_value: Number(t.target_value) || 1,
      target_period: t.target_period === 'week' ? 'week' : 'day',
      unit: t.unit ? String(t.unit) : 'lần',
      default_note: t.default_note ? String(t.default_note) : '',
      default_note_done: Boolean(t.default_note_done),
      created_at: t.created_at ? String(t.created_at) : new Date().toISOString(),
      archived_at: t.archived_at ? String(t.archived_at) : null,
    }));

  const logs: TaskLog[] = rawLogs
    .filter((l: Partial<TaskLog>) => l && l.id && l.task_id)
    .map((l: Partial<TaskLog>) => ({
      id: String(l.id),
      task_id: String(l.task_id),
      log_date: normalizeDateField(l.log_date),
      value: Number(l.value) || 0,
      target_snapshot: Number(l.target_snapshot) || 1,
      status: (l.status as TaskLog['status']) || 'pending',
      note: l.note ? String(l.note) : '',
      photo: l.photo ? String(l.photo) : '',
      updated_at: l.updated_at ? String(l.updated_at) : new Date().toISOString(),
    }));

  return { tasks, logs };
}

async function postToSheets(scriptUrl: string, payload: Record<string, unknown>): Promise<void> {
  if (!scriptUrl) return;
  const res = await fetch(scriptUrl, {
    method: 'POST',
    redirect: 'follow',
    // text/plain avoids CORS preflight OPTIONS request on Google Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Post failed');
}

export async function syncTaskToSheets(scriptUrl: string, task: Task): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_task', task });
}

export async function syncLogToSheets(scriptUrl: string, log: TaskLog): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_log', log });
}

export async function bulkSyncToSheets(
  scriptUrl: string,
  tasks: Task[],
  logs: TaskLog[]
): Promise<void> {
  await postToSheets(scriptUrl, { action: 'bulk_sync', tasks, logs });
}
