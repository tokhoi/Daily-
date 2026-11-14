export type TargetType = 'boolean' | 'count';
export type TargetPeriod = 'day' | 'week';
export type LogStatus = 'pending' | 'partial' | 'completed' | 'skipped';

export interface Task {
  id: string;
  title: string;
  emoji: string;
  color: string;
  is_recurring: boolean;
  /** 1 = Mon, 2 = Tue, ..., 7 = Sun. Empty/null when is_recurring is false */
  recurrence_days: number[];
  /** YYYY-MM-DD for one-off tasks */
  target_date: string | null;
  target_type: TargetType;
  target_value: number;
  target_period: TargetPeriod;
  unit: string;
  default_note?: string;
  default_note_done?: boolean;
  created_at: string;
  archived_at: string | null;
}

export interface DailyNote {
  text: string;
  done: boolean;
  sharedWithPartner?: boolean;
}

export interface CoupleProfile {
  myName: string;
  myCode: string;
  partnerName: string;
  partnerCode: string;
  isPaired: boolean;
  bearStyle: 'pink' | 'blue';
}

export interface PartnerCheckin {
  id: string;
  taskTitle: string;
  emoji: string;
  color: string;
  completedAt: string;
  note?: string;
  photo: string;
  reaction?: 'heart' | 'clap' | 'fire' | null;
}

export interface CoupleNudge {
  id: string;
  from: 'me' | 'partner';
  message: string;
  createdAt: string;
}

export interface TaskLog {
  /** Composite key: `${task_id}_${log_date}` */
  id: string;
  task_id: string;
  /** YYYY-MM-DD */
  log_date: string;
  value: number;
  target_snapshot: number;
  status: LogStatus;
  note?: string;
  photo?: string;
  updated_at: string;
}

export type SyncState = 'local' | 'syncing' | 'synced' | 'error';

export type AppTab = 'today' | 'couple' | 'bear3d' | 'summary' | 'settings';
export type SummaryPeriod = 'week' | 'month' | 'year';
