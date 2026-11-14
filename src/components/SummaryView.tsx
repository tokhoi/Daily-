import React, { useMemo, useState } from 'react';
import type { SummaryPeriod, Task, TaskLog } from '../types/habit';
import {
  addDays,
  getLogCompletionRatio,
  getMonthCalendarDays,
  getWeekDates,
  getYearHeatmapGrid,
  isTaskScheduledForDate,
  toDateKey,
} from '../utils/dateUtils';
import { GIcon, TaskGlyph } from './GIcon';

interface SummaryViewProps {
  tasks: Task[];
  logs: TaskLog[];
}

const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const SummaryView: React.FC<SummaryViewProps> = ({ tasks, logs }) => {
  const [period, setPeriod] = useState<SummaryPeriod>('year');
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const logByKey = useMemo(() => {
    const map = new Map<string, TaskLog>();
    logs.forEach((l) => map.set(`${l.task_id}_${l.log_date}`, l));
    return map;
  }, [logs]);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived_at), [tasks]);
  const recurringTasks = useMemo(
    () => activeTasks.filter((t) => t.is_recurring),
    [activeTasks]
  );

  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate]);

  const monthYear = anchorDate.getFullYear();
  const monthIndex = anchorDate.getMonth();
  const monthCells = useMemo(
    () => getMonthCalendarDays(monthYear, monthIndex),
    [monthYear, monthIndex]
  );

  const year = anchorDate.getFullYear();
  const yearGrid = useMemo(() => getYearHeatmapGrid(year), [year]);

  const shiftPeriod = (dir: -1 | 1) => {
    if (period === 'week') {
      setAnchorDate((d) => addDays(d, dir * 7));
    } else if (period === 'month') {
      setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
    } else {
      setAnchorDate((d) => new Date(d.getFullYear() + dir, d.getMonth(), 1));
    }
  };

  const getPeriodLabel = () => {
    if (period === 'week') {
      return `${weekDates[0].slice(5).replace('-', '/')} – ${weekDates[6].slice(5).replace('-', '/')}`;
    }
    if (period === 'month') {
      return `Tháng ${monthIndex + 1}/${monthYear}`;
    }
    return `Tổng kết năm ${year}`;
  };

  const getDayOverallRatio = (dateKey: string): number | null => {
    const scheduled = tasks.filter((t) => isTaskScheduledForDate(t, dateKey));
    if (scheduled.length === 0) return null;
    const totalRatio = scheduled.reduce(
      (sum, t) => sum + getLogCompletionRatio(t, logByKey.get(`${t.id}_${dateKey}`)),
      0
    );
    return totalRatio / scheduled.length;
  };

  const periodIndex = period === 'week' ? 0 : period === 'month' ? 1 : 2;

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* iOS Sliding Segmented Control */}
      <div className="relative grid grid-cols-3 rounded-2xl border border-pink-100 bg-white p-1 shadow-[0_4px_20px_-6px_rgba(236,72,153,0.10)]">
        {/* Sliding pill */}
        <div
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-xl bg-blue-900 shadow-sm transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(${periodIndex * 100}%)` }}
        />
        {(
          [
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'year', label: 'Năm' },
          ] as { id: SummaryPeriod; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={`relative z-10 rounded-xl py-2 text-xs font-bold transition-colors duration-300 ${
              period === tab.id ? 'text-white' : 'text-slate-500 hover:text-pink-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period Navigator */}
      <div className="flex items-center justify-between rounded-[20px] border border-pink-100 bg-white px-3 py-2 shadow-2xs">
        <button
          type="button"
          onClick={() => shiftPeriod(-1)}
          className="ios-press flex h-8 w-8 items-center justify-center rounded-xl text-pink-500 hover:bg-pink-50"
        >
          <GIcon name="chevron_left" size={22} />
        </button>
        <span className="text-sm font-extrabold text-[#231926]">{getPeriodLabel()}</span>
        <button
          type="button"
          onClick={() => shiftPeriod(1)}
          className="ios-press flex h-8 w-8 items-center justify-center rounded-xl text-pink-500 hover:bg-pink-50"
        >
          <GIcon name="chevron_right" size={22} />
        </button>
      </div>

      {/* WEEKLY VIEW */}
      {period === 'week' && (
        <div key="week-panel" className="animate-ios-page space-y-3">
          {recurringTasks.map((task) => {
            let scheduledDays = 0;
            let ratioSum = 0;
            let totalValue = 0;

            weekDates.forEach((dKey) => {
              if (isTaskScheduledForDate(task, dKey)) {
                scheduledDays++;
                const log = logByKey.get(`${task.id}_${dKey}`);
                ratioSum += getLogCompletionRatio(task, log);
                totalValue += log?.value ?? 0;
              }
            });

            const pct = scheduledDays > 0 ? Math.round((ratioSum / scheduledDays) * 100) : 0;

            return (
              <div
                key={task.id}
                className="rounded-[22px] border border-pink-100 bg-white p-4 shadow-[0_4px_20px_-6px_rgba(236,72,153,0.10)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${task.color}16` }}
                    >
                      <TaskGlyph value={task.emoji} size={20} color={task.color} filled />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#231926]">{task.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {task.target_type === 'count'
                          ? `Tổng tuần: ${totalValue} ${task.unit}`
                          : `${Math.round(ratioSum)}/${scheduledDays} ngày`}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-xl px-2.5 py-1 text-xs font-extrabold"
                    style={{ backgroundColor: `${task.color}18`, color: task.color }}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-7 gap-1.5">
                  {weekDates.map((dKey, i) => {
                    const scheduled = isTaskScheduledForDate(task, dKey);
                    const log = logByKey.get(`${task.id}_${dKey}`);
                    const ratio = scheduled ? getLogCompletionRatio(task, log) : 0;
                    return (
                      <div key={dKey} className="flex flex-col items-center gap-1">
                        <div
                          className="h-7 w-full rounded-xl border border-pink-50 transition-all duration-400"
                          style={{
                            backgroundColor: !scheduled
                              ? '#fdf2f6'
                              : ratio > 0
                                ? task.color
                                : '#fce7f3',
                            opacity: !scheduled ? 0.5 : ratio > 0 ? Math.max(0.35, ratio) : 0.65,
                          }}
                          title={`${dKey}: ${Math.round(ratio * 100)}%`}
                        />
                        <span className="text-[10px] font-semibold text-slate-400">
                          {WEEKDAY_HEADERS[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MONTHLY VIEW */}
      {period === 'month' && (
        <div
          key="month-panel"
          className="animate-ios-page rounded-[24px] border border-pink-100 bg-white p-4 shadow-[0_6px_24px_-8px_rgba(236,72,153,0.12)]"
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_HEADERS.map((h) => (
              <div key={h} className="pb-1.5 text-[11px] font-bold text-pink-400">
                {h}
              </div>
            ))}
            {monthCells.map((dKey, idx) => {
              if (!dKey) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }
              const ratio = getDayOverallRatio(dKey);
              const dayNum = Number(dKey.slice(8));
              const isToday = dKey === toDateKey(new Date());

              let bgClass = 'bg-pink-50/60 text-slate-500';
              if (ratio !== null && ratio > 0) {
                if (ratio >= 0.99) bgClass = 'bg-blue-900 text-white font-bold shadow-xs';
                else if (ratio >= 0.5) bgClass = 'bg-pink-400 text-white font-semibold';
                else bgClass = 'bg-pink-200 text-blue-950 font-semibold';
              }

              return (
                <div
                  key={dKey}
                  className={`flex h-10 flex-col items-center justify-center rounded-2xl text-xs transition-all duration-300 ${bgClass} ${
                    isToday ? 'ring-2 ring-blue-900 ring-offset-2' : ''
                  }`}
                  title={ratio !== null ? `${dKey}: ${Math.round(ratio * 100)}%` : dKey}
                >
                  <span>{dayNum}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Ít</span>
            <span className="h-3 w-3 rounded-sm bg-pink-50" />
            <span className="h-3 w-3 rounded-sm bg-pink-200" />
            <span className="h-3 w-3 rounded-sm bg-pink-400" />
            <span className="h-3 w-3 rounded-sm bg-blue-900" />
            <span>100%</span>
          </div>
        </div>
      )}

      {/* YEARLY VIEW */}
      {period === 'year' && (
        <div key="year-panel" className="animate-ios-page space-y-3">
          {recurringTasks.map((task) => {
            let scheduledCount = 0;
            let completedScore = 0;

            yearGrid.forEach((col) => {
              col.forEach((dKey) => {
                if (!dKey) return;
                if (isTaskScheduledForDate(task, dKey)) {
                  scheduledCount++;
                  completedScore += getLogCompletionRatio(
                    task,
                    logByKey.get(`${task.id}_${dKey}`)
                  );
                }
              });
            });

            const yearPct =
              scheduledCount > 0 ? Math.round((completedScore / scheduledCount) * 100) : 0;

            return (
              <div
                key={task.id}
                className="rounded-[22px] border border-pink-100 bg-white p-3.5 shadow-[0_4px_20px_-6px_rgba(236,72,153,0.10)]"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${task.color}16` }}
                    >
                      <TaskGlyph value={task.emoji} size={16} color={task.color} filled />
                    </div>
                    <p className="truncate text-sm font-bold text-[#231926]">{task.title}</p>
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      •{' '}
                      {task.target_type === 'count'
                        ? `${task.target_value} ${task.unit}/ngày`
                        : 'Hằng ngày'}
                    </span>
                  </div>
                  <span
                    className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-extrabold"
                    style={{ backgroundColor: `${task.color}15`, color: task.color }}
                  >
                    {yearPct}%
                  </span>
                </div>

                {/* 53x7 Heatmap */}
                <div className="no-scrollbar overflow-x-auto pb-1">
                  <div className="inline-flex gap-[2.5px]">
                    {yearGrid.map((col, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[2.5px]">
                        {col.map((dKey, dIdx) => {
                          if (!dKey) {
                            return <div key={dIdx} className="h-[7px] w-[7px] rounded-[2px]" />;
                          }
                          const log = logByKey.get(`${task.id}_${dKey}`);
                          const ratio = getLogCompletionRatio(task, log);
                          return (
                            <div
                              key={dKey}
                              className="h-[7px] w-[7px] rounded-[2px] transition-opacity duration-300"
                              style={{
                                backgroundColor: ratio > 0 ? task.color : '#FCE7F3',
                                opacity: ratio > 0 ? Math.max(0.38, ratio) : 0.7,
                              }}
                              title={`${dKey}: ${Math.round(ratio * 100)}%`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
