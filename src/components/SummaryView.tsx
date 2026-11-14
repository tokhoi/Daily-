import React, { useMemo, useState } from 'react';
import type { Translations } from '../i18n/translations';
import type { CoupleProfile, SummaryPeriod, Task, TaskLog } from '../types/habit';
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
  t: Translations;
  tasks: Task[];
  logs: TaskLog[];
  coupleProfile?: CoupleProfile;
  myPercent?: number;
  myWeeklyPercents?: { label: string; percent: number }[];
  partnerTodayPercent?: number;
  partnerWeeklyPercents?: number[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  t,
  tasks,
  logs,
  coupleProfile,
  myPercent = 0,
  myWeeklyPercents = [],
  partnerTodayPercent,
  partnerWeeklyPercents,
}) => {
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
      return t.monthSummary(monthIndex + 1, monthYear);
    }
    return t.yearSummary(year);
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

  const partnerWeekly =
    partnerWeeklyPercents && partnerWeeklyPercents.length === 7
      ? partnerWeeklyPercents
      : [0, 0, 0, 0, 0, 0, 0];
  const partnerToday =
    typeof partnerTodayPercent === 'number'
      ? partnerTodayPercent
      : (partnerWeekly[partnerWeekly.length - 1] ?? 0);
  const myWeekAvg =
    myWeeklyPercents.length > 0
      ? Math.round(
          myWeeklyPercents.reduce((s, d) => s + d.percent, 0) / myWeeklyPercents.length
        )
      : myPercent;
  const partnerWeekAvg = Math.round(
    partnerWeekly.reduce((s, v) => s + v, 0) / partnerWeekly.length
  );

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* Progress for one person or both people in a shared room. */}
      <div className="rounded-[24px] border border-pink-100/90 bg-white/90 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wide text-blue-950 uppercase">
              {coupleProfile?.isPaired ? 'Tiến độ của hai người (7 ngày)' : 'Tiến độ của bạn (7 ngày)'}
            </h3>
            {coupleProfile?.isPaired && (
            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-pink-500">
              {myWeekAvg === partnerWeekAvg
                ? 'Hai bạn ngang nhau'
                : myWeekAvg > partnerWeekAvg
                  ? `${coupleProfile.myName} đang dẫn`
                  : `${coupleProfile.partnerName} đang dẫn`}
            </span>
            )}
          </div>

          <div className={`mb-3 grid gap-2 ${coupleProfile?.isPaired ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="rounded-2xl bg-pink-50/70 p-2.5 text-center">
              <p className="text-[10px] font-bold text-slate-400">
                Hôm nay ({coupleProfile?.myName || 'Bạn'})
              </p>
              <p className="mt-0.5 text-base font-extrabold text-pink-500">{myPercent}%</p>
            </div>
            {coupleProfile?.isPaired && <div className="rounded-2xl bg-blue-50/60 p-2.5 text-center">
              <p className="text-[10px] font-bold text-slate-400">
                Hôm nay ({coupleProfile.partnerName})
              </p>
              <p className="mt-0.5 text-base font-extrabold text-blue-900">{partnerToday}%</p>
            </div>}
          </div>

          <div className={`mb-4 grid gap-2 text-center ${coupleProfile?.isPaired ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <div className="rounded-2xl bg-pink-50/70 p-2.5">
              <p className="text-[10px] font-bold text-slate-400">
                TB Tuần ({coupleProfile?.myName || 'Bạn'})
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-pink-500">{myWeekAvg}%</p>
            </div>
            {coupleProfile?.isPaired && <div className="rounded-2xl bg-pink-50/70 p-2.5">
              <p className="text-[10px] font-bold text-slate-400">Chênh lệch</p>
              <p className="mt-0.5 text-sm font-extrabold text-blue-950">
                {myWeekAvg === partnerWeekAvg
                  ? '0%'
                  : myWeekAvg > partnerWeekAvg
                  ? `+${myWeekAvg - partnerWeekAvg}%`
                  : `${myWeekAvg - partnerWeekAvg}%`}
              </p>
            </div>}
            {coupleProfile?.isPaired && <div className="rounded-2xl bg-blue-50/60 p-2.5">
              <p className="text-[10px] font-bold text-slate-400">
                TB Tuần ({coupleProfile.partnerName})
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-blue-900">{partnerWeekAvg}%</p>
            </div>}
          </div>

          {myWeeklyPercents.length > 0 && (
            <>
              <div className="flex h-28 items-end justify-between gap-2 px-1">
                {myWeeklyPercents.map((day, idx) => {
                  const pVal = partnerWeekly[idx] ?? 0;
                  return (
                    <div key={day.label} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-20 w-full items-end justify-center gap-1">
                        <div
                          className="w-2.5 rounded-t-full bg-pink-400 transition-all duration-500"
                          style={{ height: `${Math.max(8, day.percent)}%` }}
                          title={`${coupleProfile?.myName || 'Bạn'}: ${day.percent}%`}
                        />
                        {coupleProfile?.isPaired && (
                        <div
                          className="w-2.5 rounded-t-full bg-blue-900 transition-all duration-500"
                          style={{ height: `${Math.max(8, pVal)}%` }}
                          title={`${coupleProfile.partnerName}: ${pVal}%`}
                        />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{day.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-center gap-4 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-blue-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
                  {coupleProfile?.myName || 'Bạn'}
                </span>
                {coupleProfile?.isPaired && (
                <span className="flex items-center gap-1.5 text-blue-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-900" />
                  {coupleProfile.partnerName}
                </span>
                )}
              </div>
            </>
          )}
        </div>
      {/* iOS Sliding Segmented Control */}
      <div className="relative grid grid-cols-3 rounded-2xl border border-pink-100 bg-white p-1 shadow-[0_4px_20px_-6px_rgba(236,72,153,0.10)]">
        {/* Sliding pill */}
        <div
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-xl bg-blue-900 shadow-sm transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: `translateX(${periodIndex * 100}%)` }}
        />
        {(
          [
            { id: 'week', label: t.week },
            { id: 'month', label: t.month },
            { id: 'year', label: t.year },
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
                          ? t.weekTotal(totalValue, task.unit)
                          : `${Math.round(ratioSum)}/${scheduledDays} ${t.daysLabel}`}
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
                          {t.weekdays[i]}
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
            {t.weekdays.map((h) => (
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
            <span>{t.less}</span>
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
                        ? `${task.target_value} ${task.unit}`
                        : t.dailyLabel}
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
