import type {
  AppUser,
  CoupleChatMessage,
  CoupleNudge,
  CoupleProfile,
  DailyNote,
  PartnerCheckin,
  Task,
  TaskLog,
} from '../types/habit';

const STORAGE_KEYS = {
  TASKS: 'daily_miniapp_tasks_v1',
  LOGS: 'daily_miniapp_logs_v1',
  DAILY_NOTES: 'daily_miniapp_daily_notes_v1',
  SHEET_URL: 'daily_miniapp_sheet_url_v1',
  CURRENT_USER: 'daily_miniapp_current_user_v1',
};

export function loadCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: AppUser): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

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
): Promise<{
  tasks: Task[];
  logs: TaskLog[];
  users?: AppUser[];
  coupleChat?: CoupleChatMessage[];
  coupleNudges?: CoupleNudge[];
  partnerCheckins?: PartnerCheckin[];
}> {
  const res = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Sync failed');

  const rawTasks = Array.isArray(data.tasks) ? data.tasks : [];
  const rawLogs = Array.isArray(data.logs) ? data.logs : [];
  const rawUsers = Array.isArray(data.users) ? data.users : [];
  const rawChat = Array.isArray(data.coupleChat) ? data.coupleChat : [];
  const rawNudges = Array.isArray(data.coupleNudges) ? data.coupleNudges : [];
  const rawCheckins = Array.isArray(data.partnerCheckins) ? data.partnerCheckins : [];

  const tasks: Task[] = rawTasks
    .filter((t: Partial<Task>) => t && t.id && t.title)
    .map((t: Partial<Task>) => ({
      id: String(t.id),
      user_id: t.user_id ? String(t.user_id) : undefined,
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
      user_id: l.user_id ? String(l.user_id) : undefined,
      task_id: String(l.task_id),
      log_date: normalizeDateField(l.log_date),
      value: Number(l.value) || 0,
      target_snapshot: Number(l.target_snapshot) || 1,
      status: (l.status as TaskLog['status']) || 'pending',
      note: l.note ? String(l.note) : '',
      photo: l.photo ? String(l.photo) : '',
      updated_at: l.updated_at ? String(l.updated_at) : new Date().toISOString(),
    }));

  const users: AppUser[] = rawUsers
    .filter((u: Partial<AppUser>) => u && u.user_id && u.display_name)
    .map((u: Partial<AppUser>) => ({
      user_id: String(u.user_id),
      display_name: String(u.display_name),
      partner_id: u.partner_id ? String(u.partner_id) : undefined,
      room_code: u.room_code ? String(u.room_code) : undefined,
      created_at: u.created_at ? String(u.created_at) : new Date().toISOString(),
    }));

  const coupleChat: CoupleChatMessage[] = rawChat
    .filter((m: Partial<CoupleChatMessage>) => m && m.id && m.text)
    .map((m: Partial<CoupleChatMessage>) => ({
      id: String(m.id),
      sender: m.sender === 'partner' ? 'partner' : 'me',
      sender_id: m.sender_id ? String(m.sender_id) : undefined,
      room_code: m.room_code ? String(m.room_code) : undefined,
      text: String(m.text),
      createdAt: m.createdAt ? String(m.createdAt) : '',
    }));

  const coupleNudges: CoupleNudge[] = rawNudges
    .filter((n: Partial<CoupleNudge>) => n && n.id && n.message)
    .map((n: Partial<CoupleNudge>) => ({
      id: String(n.id),
      from: n.from === 'partner' ? 'partner' : 'me',
      sender_id: n.sender_id ? String(n.sender_id) : undefined,
      room_code: n.room_code ? String(n.room_code) : undefined,
      message: String(n.message),
      createdAt: n.createdAt ? String(n.createdAt) : '',
    }));

  const partnerCheckins: PartnerCheckin[] = rawCheckins
    .filter((c: Partial<PartnerCheckin>) => c && c.id && c.taskTitle)
    .map((c: Partial<PartnerCheckin>) => ({
      id: String(c.id),
      taskTitle: String(c.taskTitle),
      emoji: c.emoji ? String(c.emoji) : 'favorite',
      color: c.color ? String(c.color) : '#F472B6',
      completedAt: c.completedAt ? String(c.completedAt) : '',
      note: c.note ? String(c.note) : undefined,
      photo: c.photo ? String(c.photo) : '',
      reaction:
        c.reaction === 'heart' || c.reaction === 'clap' || c.reaction === 'fire'
          ? c.reaction
          : null,
    }));

  return {
    tasks,
    logs,
    users: users.length > 0 ? users : undefined,
    coupleChat: coupleChat.length > 0 ? coupleChat : undefined,
    coupleNudges: coupleNudges.length > 0 ? coupleNudges : undefined,
    partnerCheckins: partnerCheckins.length > 0 ? partnerCheckins : undefined,
  };
}

async function postToSheets(
  scriptUrl: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!scriptUrl) return {};
  const res = await fetch(scriptUrl, {
    method: 'POST',
    redirect: 'follow',
    // text/plain avoids CORS preflight OPTIONS request on Google Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  if (!data.ok) {
    const errMsg = String(data.error || 'Post failed');
    if (errMsg.includes('Unknown action: register') || errMsg.includes('Unknown action: login')) {
      throw new Error(
        'Google Apps Script đang chạy bản cũ. Hãy copy file Code.gs mới dán vào Apps Script và chọn Deploy -> Manage deployments -> New version!'
      );
    }
    throw new Error(errMsg);
  }
  return data;
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface LocalAuthRecord extends AppUser {
  password_salt: string;
  password_hash: string;
}

const LOCAL_AUTH_KEY = 'daily_miniapp_local_auth_v1';

function loadLocalAuthUsers(): LocalAuthRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? (JSON.parse(raw) as LocalAuthRecord[]) : [];
  } catch {
    return [];
  }
}

export async function registerAccount(
  scriptUrl: string,
  params: { user_id: string; display_name: string; password: string }
): Promise<AppUser> {
  const cleanId = params.user_id.trim().toLowerCase();
  const displayName = params.display_name.trim();

  if (scriptUrl) {
    const res = await postToSheets(scriptUrl, {
      action: 'register',
      user_id: cleanId,
      display_name: displayName,
      password: params.password,
    });
    return res.user as AppUser;
  }

  const localUsers = loadLocalAuthUsers();
  if (localUsers.some((u) => u.user_id === cleanId)) {
    throw new Error('Tên đăng nhập này đã tồn tại.');
  }
  const salt = crypto.randomUUID();
  const hash = await sha256Hex(`${salt}:${params.password}`);
  const token = crypto.randomUUID();
  const record: LocalAuthRecord = {
    user_id: cleanId,
    display_name: displayName,
    password_salt: salt,
    password_hash: hash,
    auth_token: token,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify([...localUsers, record]));
  return {
    user_id: record.user_id,
    display_name: record.display_name,
    auth_token: record.auth_token,
    created_at: record.created_at,
  };
}

export async function loginAccount(
  scriptUrl: string,
  params: { user_id: string; password: string }
): Promise<AppUser> {
  const cleanId = params.user_id.trim().toLowerCase();

  if (scriptUrl) {
    const res = await postToSheets(scriptUrl, {
      action: 'login',
      user_id: cleanId,
      password: params.password,
    });
    return res.user as AppUser;
  }

  const localUsers = loadLocalAuthUsers();
  const found = localUsers.find((u) => u.user_id === cleanId);
  if (!found) {
    throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
  }
  const hash = await sha256Hex(`${found.password_salt}:${params.password}`);
  if (hash !== found.password_hash) {
    throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
  }
  return {
    user_id: found.user_id,
    display_name: found.display_name,
    partner_id: found.partner_id,
    room_code: found.room_code,
    auth_token: crypto.randomUUID(),
    created_at: found.created_at,
  };
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

export async function syncUserToSheets(scriptUrl: string, user: AppUser): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_user', user });
}

export async function pairCoupleOnSheets(
  scriptUrl: string,
  params: { user_id: string; partner_code: string; room_code: string; partner_name?: string }
): Promise<{ user: AppUser | null; partner: AppUser | null }> {
  const res = await postToSheets(scriptUrl, {
    action: 'pair_couple',
    ...params,
  });
  return {
    user: (res.user as AppUser) || null,
    partner: (res.partner as AppUser) || null,
  };
}

export async function syncCoupleProfileToSheets(
  scriptUrl: string,
  profile: CoupleProfile
): Promise<void> {
  await postToSheets(scriptUrl, {
    action: 'upsert_couple_profile',
    profile: { ...profile, id: profile.myCode, updated_at: new Date().toISOString() },
  });
}

export async function syncCoupleChatToSheets(
  scriptUrl: string,
  message: CoupleChatMessage
): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_couple_chat', message });
}

export async function syncCoupleNudgeToSheets(
  scriptUrl: string,
  nudge: CoupleNudge
): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_couple_nudge', nudge });
}

export async function syncPartnerCheckinToSheets(
  scriptUrl: string,
  checkin: PartnerCheckin
): Promise<void> {
  await postToSheets(scriptUrl, { action: 'upsert_partner_checkin', checkin });
}
