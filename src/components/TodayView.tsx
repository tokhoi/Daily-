import React, { useEffect, useRef, useState } from 'react';
import type { Translations } from '../i18n/translations';
import type { DailyNote, Task, TaskLog } from '../types/habit';
import {
  addDays,
  getLogCompletionRatio,
  getWeekDates,
  isTaskScheduledForDate,
  parseDateKey,
  toDateKey,
} from '../utils/dateUtils';
import { GIcon, TaskGlyph } from './GIcon';

interface TodayViewProps {
  t: Translations;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  tasks: Task[];
  logs: TaskLog[];
  dailyNote?: DailyNote;
  weatherTip?: string;
  scrollToTasksTrigger?: number;
  onToggleBoolean: (task: Task, dateKey: string) => void;
  onIncrementCount: (task: Task, dateKey: string, delta: number) => void;
  onToggleSkip: (task: Task, dateKey: string) => void;
  onUpdateNote: (task: Task, dateKey: string, note: string) => void;
  onToggleTaskDefaultNote: (task: Task) => void;
  onSaveDailyNote: (dateKey: string, next: DailyNote) => void;
  onArchiveTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onOpenAddModal: () => void;
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const CONFETTI_PARTICLES = [
  { tx: '-34px', ty: '-36px', rot: '-45deg', color: '#F472B6', size: 7 },
  { tx: '30px', ty: '-40px', rot: '60deg', color: '#1E3A8A', size: 8 },
  { tx: '-48px', ty: '8px', rot: '-80deg', color: '#F59E0B', size: 6 },
  { tx: '46px', ty: '12px', rot: '75deg', color: '#10B981', size: 7 },
  { tx: '-20px', ty: '36px', rot: '30deg', color: '#3B82F6', size: 6 },
  { tx: '22px', ty: '34px', rot: '-30deg', color: '#FB7185', size: 8 },
  { tx: '0px', ty: '-48px', rot: '90deg', color: '#F472B6', size: 6 },
  { tx: '-40px', ty: '-18px', rot: '45deg', color: '#1E40AF', size: 5 },
  { tx: '40px', ty: '-18px', rot: '-65deg', color: '#FBBF24', size: 6 },
];

export const TodayView: React.FC<TodayViewProps> = ({
  t,
  selectedDate,
  onSelectDate,
  tasks,
  logs,
  dailyNote,
  weatherTip,
  scrollToTasksTrigger = 0,
  onToggleBoolean,
  onIncrementCount,
  onToggleSkip,
  onUpdateNote,
  onToggleTaskDefaultNote,
  onSaveDailyNote,
  onArchiveTask,
  onEditTask,
  onOpenAddModal,
}) => {
  const anchor = parseDateKey(selectedDate);
  const weekDates = getWeekDates(anchor);
  const todayKey = toDateKey(new Date());

  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [burstTaskId, setBurstTaskId] = useState<string | null>(null);
  const [editingNoteTaskId, setEditingNoteTaskId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isEditingDailyNote, setIsEditingDailyNote] = useState(false);
  const [dailyNoteDraft, setDailyNoteDraft] = useState('');

  const holdTimerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const taskListRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (scrollToTasksTrigger > 0) {
      taskListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToTasksTrigger]);

  const scheduledTasks = tasks.filter((t) => isTaskScheduledForDate(t, selectedDate));
  const recurringTasks = scheduledTasks.filter((t) => t.is_recurring);
  const adhocTasks = scheduledTasks.filter((t) => !t.is_recurring);

  const logMap = new Map<string, TaskLog>();
  logs.forEach((l) => {
    if (l.log_date === selectedDate) {
      logMap.set(l.task_id, l);
    }
  });

  const totalTasks = scheduledTasks.length;
  const completedCount = scheduledTasks.filter((t) => {
    const ratio = getLogCompletionRatio(t, logMap.get(t.id));
    return ratio >= 1;
  }).length;
  const overallPercent =
    totalTasks === 0
      ? 0
      : Math.round(
          (scheduledTasks.reduce(
            (sum, t) => sum + getLogCompletionRatio(t, logMap.get(t.id)),
            0
          ) /
            totalTasks) *
            100
        );

  const triggerBurst = (taskId: string) => {
    setBurstTaskId(taskId);
    window.setTimeout(() => {
      setBurstTaskId((curr) => (curr === taskId ? null : curr));
    }, 760);
  };

  const clearHold = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldingTaskId(null);
    startPosRef.current = null;
  };

  const startHold = (task: Task, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    clearHold();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setHoldingTaskId(task.id);
    holdTimerRef.current = window.setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(18);
      clearHold();
      onEditTask(task);
    }, 450);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearHold();
    }
  };

  const openNoteEditor = (task: Task, existingNote?: string) => {
    if (editingNoteTaskId === task.id) {
      setEditingNoteTaskId(null);
      return;
    }
    setEditingNoteTaskId(task.id);
    setNoteDraft(existingNote || '');
  };

  const saveNote = (task: Task) => {
    onUpdateNote(task, selectedDate, noteDraft.trim());
    setEditingNoteTaskId(null);
  };

  const formatDateLabel = (key: string) => {
    if (key === todayKey) return t.today;
    if (key === toDateKey(addDays(new Date(), -1))) return t.yesterday;
    if (key === toDateKey(addDays(new Date(), 1))) return t.tomorrow;
    const d = parseDateKey(key);
    const isoIdx = (d.getDay() + 6) % 7;
    return `${t.weekdays[isoIdx]}, ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const renderTaskCard = (task: Task) => {
    const log = logMap.get(task.id);
    const value = log?.value ?? 0;
    const isSkipped = log?.status === 'skipped';
    const target = log?.target_snapshot || task.target_value || 1;
    const isDone = !isSkipped && value >= target;
    const ratio = Math.min(1, value / target);
    const isHolding = holdingTaskId === task.id;
    const isBursting = burstTaskId === task.id;
    const isEditingNote = editingNoteTaskId === task.id;

    return (
      <div
        key={task.id}
        onPointerDown={(e) => startHold(task, e)}
        onPointerMove={handlePointerMove}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative select-none rounded-[22px] border p-3.5 transition-all duration-300 ${
          isHolding
            ? 'animate-hold-glow border-blue-800 bg-blue-50/40'
            : isDone
              ? 'border-pink-200 bg-gradient-to-br from-white via-pink-50/50 to-blue-50/25 shadow-[0_6px_22px_-6px_rgba(30,58,138,0.12)]'
              : isSkipped
                ? 'border-pink-100 bg-white/60 opacity-65'
                : 'border-pink-100/90 bg-white shadow-[0_4px_20px_-6px_rgba(244,114,182,0.12)] hover:border-pink-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ${
              isDone ? 'scale-105' : ''
            }`}
            style={{
              backgroundColor: isDone ? `${task.color}22` : `${task.color}14`,
            }}
          >
            <TaskGlyph value={task.emoji} size={24} color={task.color} filled={isDone} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[15px] font-bold transition-colors duration-300 ${
                isDone
                  ? 'text-blue-950/50 line-through'
                  : isSkipped
                    ? 'text-slate-400 line-through'
                    : 'text-[#1E293B]'
              }`}
            >
              {task.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {isSkipped ? (
                <span className="font-semibold text-amber-600">{t.skippedToday}</span>
              ) : task.target_type === 'count' ? (
                <span>
                  <strong className="font-bold text-blue-950">{value}</strong> / {target}{' '}
                  {task.unit}
                </span>
              ) : isDone ? (
                <span className="font-semibold text-blue-900">{t.completed}</span>
              ) : (
                <span>{t.notCompleted}</span>
              )}
            </p>
          </div>

          {/* Controls + Confetti */}
          <div className="relative flex items-center gap-1.5">
            {isBursting && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {CONFETTI_PARTICLES.map((p, idx) => (
                  <span
                    key={idx}
                    className="confetti-dot rounded-full"
                    style={
                      {
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        '--tx': p.tx,
                        '--ty': p.ty,
                        '--rot': p.rot,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}

            {task.target_type === 'count' && !isSkipped ? (
              <div className="flex items-center gap-1 rounded-2xl border border-pink-100 bg-pink-50/60 p-1">
                <button
                  type="button"
                  onClick={() => onIncrementCount(task, selectedDate, -1)}
                  disabled={value <= 0}
                  className="ios-press flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-2xs disabled:opacity-35"
                  aria-label="Giảm"
                >
                  <GIcon name="remove" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (value + 1 === target) {
                      triggerBurst(task.id);
                    }
                    onIncrementCount(task, selectedDate, 1);
                  }}
                  className="ios-press flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: task.color }}
                  aria-label="Tăng"
                >
                  <GIcon name="add" size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onToggleBoolean(task, selectedDate);
                }}
                className={`ios-press flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                  isDone
                    ? 'animate-ios-pop border-transparent text-white shadow-md'
                    : 'border-pink-200 bg-pink-50/30 text-transparent hover:border-blue-800/40'
                }`}
                style={isDone ? { backgroundColor: task.color } : undefined}
                aria-label="Đánh dấu hoàn thành"
              >
                <GIcon name="check" size={22} weight={600} />
              </button>
            )}
          </div>
        </div>

        {/* Task Default Note (with tickable checkbox) */}
        {task.default_note && (
          <label className="mt-2.5 flex cursor-pointer items-center gap-2 rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-1.5 text-xs">
            <input
              type="checkbox"
              checked={Boolean(task.default_note_done)}
              onChange={() => onToggleTaskDefaultNote(task)}
              className="h-3.5 w-3.5 shrink-0 rounded accent-blue-900"
            />
            <span
              className={`flex-1 ${
                task.default_note_done
                  ? 'text-slate-400 line-through'
                  : 'font-medium text-blue-950/85'
              }`}
            >
              {task.default_note}
            </span>
          </label>
        )}

        {/* Photo Proof Thumbnail & Saved Daily Log Note Preview */}
        {(log?.photo || (log?.note && !isEditingNote)) && (
          <div className="mt-2.5 flex items-start gap-2">
            {log?.photo && (
              <button
                type="button"
                onClick={() => setPreviewPhoto(log.photo!)}
                className="ios-press shrink-0 overflow-hidden rounded-xl border border-pink-200 shadow-2xs"
                title="Xem ảnh xác nhận"
              >
                <img
                  src={log.photo}
                  alt="Xác nhận"
                  className="h-11 w-11 object-cover"
                />
              </button>
            )}
            {log?.note && !isEditingNote && (
              <div
                onClick={() => openNoteEditor(task, log.note)}
                className="flex flex-1 cursor-pointer items-start gap-1.5 rounded-xl bg-pink-50/70 px-3 py-2 text-xs text-blue-950/80"
              >
                <GIcon name="edit_note" size={15} className="mt-0.5 text-pink-500" />
                <span className="flex-1 leading-relaxed">{log.note}</span>
              </div>
            )}
          </div>
        )}

        {/* Inline Take-Note Editor */}
        {isEditingNote && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveNote(task);
                }
              }}
              placeholder={t.noteInlinePlaceholder}
              className="flex-1 rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-800 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => saveNote(task)}
              className="ios-press rounded-xl bg-blue-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              {t.save}
            </button>
          </div>
        )}

        {/* Smooth Progress bar for count tasks */}
        {task.target_type === 'count' && !isSkipped && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-pink-100/70">
            <div
              className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ width: `${ratio * 100}%`, backgroundColor: task.color }}
            />
          </div>
        )}

        {/* Secondary actions */}
        <div className="mt-2.5 flex items-center justify-between border-t border-pink-50 pt-2 text-[11px] text-slate-400">
          <span className="text-[10px] text-pink-300">{t.holdToEdit}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openNoteEditor(task, log?.note)}
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 transition hover:bg-pink-50 ${
                log?.note || isEditingNote ? 'font-semibold text-blue-900' : 'hover:text-blue-900'
              }`}
            >
              <GIcon name="edit_note" size={14} />
              {t.noteBtn}
            </button>
            <button
              type="button"
              onClick={() => onToggleSkip(task, selectedDate)}
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 transition hover:bg-pink-50 ${
                isSkipped ? 'font-semibold text-amber-600' : 'hover:text-pink-500'
              }`}
            >
              <GIcon name="skip_next" size={14} />
              {isSkipped ? t.unskipBtn : t.skipBtn}
            </button>
            <button
              type="button"
              onClick={() => onArchiveTask(task)}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <GIcon name="visibility_off" size={14} />
              {t.hideBtn}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* Date Navigation Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-3.5 shadow-[0_6px_24px_-8px_rgba(244,114,182,0.14)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectDate(toDateKey(addDays(anchor, -1)))}
            className="ios-press flex h-9 w-9 items-center justify-center rounded-xl text-blue-900 hover:bg-pink-50"
            aria-label="Ngày trước"
          >
            <GIcon name="chevron_left" size={22} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-blue-950">
              {formatDateLabel(selectedDate)}
            </span>
            {selectedDate !== todayKey && (
              <button
                type="button"
                onClick={() => onSelectDate(todayKey)}
                className="ios-press rounded-full bg-blue-900/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-900"
              >
                {t.backToToday}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectDate(toDateKey(addDays(anchor, 1)))}
            className="ios-press flex h-9 w-9 items-center justify-center rounded-xl text-blue-900 hover:bg-pink-50"
            aria-label="Ngày sau"
          >
            <GIcon name="chevron_right" size={22} />
          </button>
        </div>

        {/* 7-day strip */}
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {weekDates.map((dKey, idx) => {
            const d = parseDateKey(dKey);
            const isSelected = dKey === selectedDate;
            const isToday = dKey === todayKey;
            return (
              <button
                key={dKey}
                type="button"
                onClick={() => onSelectDate(dKey)}
                className={`ios-press flex flex-col items-center rounded-2xl py-2 text-xs transition-all duration-300 ${
                  isSelected
                    ? 'bg-blue-900 font-bold text-white shadow-md shadow-blue-900/25'
                    : isToday
                      ? 'bg-pink-100/90 font-bold text-blue-900'
                      : 'text-slate-500 hover:bg-pink-50'
                }`}
              >
                <span className="text-[10px] opacity-80">{t.weekdays[idx]}</span>
                <span className="mt-0.5 text-xs">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Progress Summary Card */}
      <div
        className={`rounded-[24px] border p-4 transition-all duration-500 ${
          overallPercent === 100 && totalTasks > 0
            ? 'border-blue-900/20 bg-gradient-to-r from-pink-50 via-white to-blue-50/70 shadow-[0_10px_30px_-8px_rgba(30,58,138,0.22)]'
            : 'border-pink-100 bg-gradient-to-r from-white via-pink-50/40 to-blue-50/20 shadow-[0_6px_24px_-8px_rgba(244,114,182,0.12)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-pink-500">
              {overallPercent === 100 && totalTasks > 0
                ? t.progress100
                : t.progressToday}
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-blue-950">
              {completedCount}/{totalTasks} {t.tasksDoneSuffix}
            </p>
          </div>
          <div className="animate-gradient-flow flex h-12 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-blue-900 text-sm font-extrabold text-white shadow-md shadow-blue-900/20">
            {overallPercent}%
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-pink-100">
          <div
            className="animate-gradient-flow h-full rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-blue-900 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Daily Note Card (Ghi chú cho hôm nay) */}
      <div className="rounded-[22px] border border-pink-100 bg-white p-3.5 shadow-[0_4px_18px_-6px_rgba(244,114,182,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
            <GIcon name="edit_note" size={17} className="text-pink-500" />
            <span>{t.dailyNoteTitle} {formatDateLabel(selectedDate).toLowerCase()}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDailyNoteDraft(dailyNote?.text || '');
              setIsEditingDailyNote((v) => !v);
            }}
            className="text-[11px] font-bold text-pink-500 hover:text-blue-900"
          >
            {isEditingDailyNote ? t.close : dailyNote?.text ? t.edit : t.write}
          </button>
        </div>

        {isEditingDailyNote ? (
          <div className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={dailyNoteDraft}
              onChange={(e) => setDailyNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSaveDailyNote(selectedDate, {
                    text: dailyNoteDraft.trim(),
                    done: dailyNote?.done ?? false,
                  });
                  setIsEditingDailyNote(false);
                }
              }}
              placeholder={t.dailyNotePlaceholder}
              className="flex-1 rounded-xl border border-pink-200 bg-pink-50/40 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-900 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => {
                onSaveDailyNote(selectedDate, {
                  text: dailyNoteDraft.trim(),
                  done: dailyNote?.done ?? false,
                });
                setIsEditingDailyNote(false);
              }}
              className="ios-press rounded-xl bg-blue-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              {t.save}
            </button>
          </div>
        ) : dailyNote?.text ? (
          <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-xl bg-pink-50/60 px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={dailyNote.done}
              onChange={() =>
                onSaveDailyNote(selectedDate, {
                  text: dailyNote.text,
                  done: !dailyNote.done,
                })
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-900"
            />
            <span
              className={`flex-1 leading-relaxed ${
                dailyNote.done
                  ? 'text-slate-400 line-through'
                  : 'font-medium text-blue-950'
              }`}
            >
              {dailyNote.text}
            </span>
          </label>
        ) : (
          <p className="mt-1 text-[11px] text-slate-400">
            {t.dailyNoteEmpty}
          </p>
        )}

        {weatherTip && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-blue-50/60 px-3 py-2 text-[11px] font-semibold text-blue-900">
            <GIcon name="wb_sunny" size={14} className="mt-0.5 text-pink-400" />
            <span className="leading-relaxed">{weatherTip}</span>
          </div>
        )}
      </div>

      {/* Recurring Tasks */}
      <section ref={taskListRef} className="scroll-mt-20 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
            <GIcon name="repeat" size={16} />
            <span>{t.recurringTasks} ({recurringTasks.length})</span>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="ios-press flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-blue-900 hover:bg-pink-200/70"
          >
            <GIcon name="add" size={15} />
            {t.addTask}
          </button>
        </div>
        {recurringTasks.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-pink-200 bg-white p-6 text-center text-xs text-slate-400">
            {t.noRecurring}
          </div>
        ) : (
          <div className="space-y-3">{recurringTasks.map(renderTaskCard)}</div>
        )}
      </section>

      {/* Ad-hoc / One-off Tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-500">
            <GIcon name="auto_awesome" size={16} filled />
            <span>{t.adhocTasks} ({adhocTasks.length})</span>
          </div>
        </div>
        {adhocTasks.length === 0 ? (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="ios-press w-full rounded-[22px] border border-dashed border-pink-200 bg-white p-4 text-center text-xs font-semibold text-blue-900 hover:bg-pink-50/40"
          >
            {t.addAdhocPrompt} {formatDateLabel(selectedDate).toLowerCase()}
          </button>
        ) : (
          <div className="space-y-3">{adhocTasks.map(renderTaskCard)}</div>
        )}
      </section>

      {/* Fullscreen Photo Preview Lightbox */}
      {previewPhoto && (
        <div
          className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-6 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <img
            src={previewPhoto}
            alt="Ảnh xác nhận hoàn thành"
            className="animate-ios-pop max-h-[80vh] max-w-full rounded-3xl border-4 border-white shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
