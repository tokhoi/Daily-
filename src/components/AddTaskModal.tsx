import React, { useState } from 'react';
import { ICON_PRESETS, TASK_COLORS } from '../data/seedData';
import type { TargetType, Task } from '../types/habit';
import { GIcon } from './GIcon';

interface AddTaskModalProps {
  selectedDate: string;
  editingTask?: Task | null;
  onClose: () => void;
  onSave: (task: Task, isEdit: boolean) => void;
}

const DAY_CHIPS = [
  { label: 'T2', value: 1 },
  { label: 'T3', value: 2 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 4 },
  { label: 'T6', value: 5 },
  { label: 'T7', value: 6 },
  { label: 'CN', value: 7 },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  selectedDate,
  editingTask,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(editingTask);

  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [icon, setIcon] = useState(
    editingTask?.emoji && ICON_PRESETS.includes(editingTask.emoji)
      ? editingTask.emoji
      : ICON_PRESETS[0]
  );
  const [color, setColor] = useState(editingTask?.color ?? TASK_COLORS[0].hex);
  const [isRecurring, setIsRecurring] = useState(editingTask?.is_recurring ?? true);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
    editingTask?.recurrence_days?.length ? editingTask.recurrence_days : [1, 2, 3, 4, 5, 6, 7]
  );
  const [targetType, setTargetType] = useState<TargetType>(
    editingTask?.target_type ?? 'boolean'
  );
  const [targetValue, setTargetValue] = useState(
    editingTask?.target_type === 'count' ? editingTask.target_value : 8
  );
  const [unit, setUnit] = useState(
    editingTask?.target_type === 'count' ? editingTask.unit : 'ly'
  );

  const toggleDay = (day: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const nextTask: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      emoji: icon,
      color,
      is_recurring: isRecurring,
      recurrence_days: isRecurring
        ? recurrenceDays.length > 0
          ? recurrenceDays
          : [1, 2, 3, 4, 5, 6, 7]
        : [],
      target_date: isRecurring
        ? null
        : editingTask?.target_date || selectedDate,
      target_type: targetType,
      target_value: targetType === 'boolean' ? 1 : Math.max(1, targetValue),
      target_period: 'day',
      unit: targetType === 'boolean' ? 'lần' : unit.trim() || 'lần',
      created_at: editingTask?.created_at || `${selectedDate}T00:00:00.000Z`,
      archived_at: editingTask?.archived_at ?? null,
    };

    onSave(nextTask, isEdit);
    onClose();
  };

  return (
    <div
      className="animate-ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-pink-950/25 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-ios-sheet w-full max-w-[430px] rounded-t-[32px] bg-white p-5 shadow-2xl sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-pink-200 sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#231926]">
            {isEdit ? 'Chỉnh sửa công việc' : 'Thêm việc mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100"
          >
            <GIcon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600">Tên công việc</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Uống nước, Đọc sách, Gửi báo cáo..."
              className="mt-1.5 w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-[#231926] outline-none transition focus:border-pink-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600">Biểu tượng</label>
            <div className="no-scrollbar mt-1.5 flex gap-2 overflow-x-auto pb-1">
              {ICON_PRESETS.map((ic) => {
                const active = icon === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`ios-press flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      active
                        ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20'
                        : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                    }`}
                  >
                    <GIcon name={ic} size={20} filled={active} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600">Màu sắc</label>
            <div className="mt-2 flex gap-2.5">
              {TASK_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`ios-press h-7 w-7 rounded-full transition-transform duration-300 ${
                    color === c.hex ? 'scale-110 ring-2 ring-purple-600 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600">Tần suất</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-2xl bg-pink-50/80 p-1">
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`ios-press rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                  isRecurring ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Cố định (Lặp lại)
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`ios-press rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                  !isRecurring ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Chỉ 1 ngày
              </button>
            </div>

            {isRecurring && (
              <div className="mt-2.5 flex justify-between gap-1.5">
                {DAY_CHIPS.map((d) => {
                  const active = recurrenceDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`ios-press flex-1 rounded-xl py-1.5 text-xs font-bold transition-all duration-300 ${
                        active
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-pink-50 text-pink-400 hover:bg-pink-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600">Cách đo lường</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-2xl bg-pink-50/80 p-1">
              <button
                type="button"
                onClick={() => setTargetType('boolean')}
                className={`ios-press rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                  targetType === 'boolean'
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Tick hoàn thành
              </button>
              <button
                type="button"
                onClick={() => setTargetType('count')}
                className={`ios-press rounded-xl py-2 text-xs font-bold transition-all duration-300 ${
                  targetType === 'count' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Đếm số lượng
              </button>
            </div>

            {targetType === 'count' && (
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Mục tiêu / ngày</label>
                  <input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-sm outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Đơn vị</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ly, trang, phút..."
                    className="mt-1 w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-sm outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="ios-press animate-gradient-flow w-full rounded-2xl bg-gradient-to-r from-pink-400 via-blue-800 to-blue-950 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-900/20"
          >
            {isEdit ? 'Cập nhật công việc' : 'Lưu công việc'}
          </button>
        </form>
      </div>
    </div>
  );
};
