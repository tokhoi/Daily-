import React, { useState } from 'react';
import type { Task } from '../types/habit';
import { GIcon } from './GIcon';

interface PlushSvgProps {
  clapping?: boolean;
  size?: number;
}

export const JellycatPlushSvg: React.FC<PlushSvgProps> = ({
  clapping = false,
  size = 96,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="animate-plush-bounce shrink-0 drop-shadow-[0_6px_12px_rgba(244,114,182,0.28)]"
      aria-hidden="true"
    >
      {/* Left & Right Round Plush Ears */}
      <g className="animate-ear-wiggle">
        <circle cx="34" cy="30" r="14" fill="#F9A8D4" />
        <circle cx="34" cy="31" r="8" fill="#FCE7F3" />
      </g>
      <g className="animate-ear-wiggle" style={{ animationDelay: '0.3s' }}>
        <circle cx="86" cy="30" r="14" fill="#F9A8D4" />
        <circle cx="86" cy="31" r="8" fill="#FCE7F3" />
      </g>

      {/* Chubby Body */}
      <ellipse cx="60" cy="86" rx="28" ry="24" fill="#F9A8D4" />
      <ellipse cx="60" cy="88" rx="17" ry="15" fill="#FFF1F6" />

      {/* Plush Feet */}
      <ellipse cx="42" cy="106" rx="10" ry="7" fill="#F472B6" />
      <ellipse cx="78" cy="106" rx="10" ry="7" fill="#F472B6" />

      {/* Fluffy Head */}
      <ellipse cx="60" cy="52" rx="32" ry="27" fill="#FBCFE8" />

      {/* Muzzle */}
      <ellipse cx="60" cy="59" rx="13" ry="10" fill="#FFF5F8" />
      {/* Stitched Nose & Smile */}
      <ellipse cx="60" cy="55" rx="4" ry="2.8" fill="#1E3A8A" />
      <path
        d="M56 60 Q60 64 64 60"
        fill="none"
        stroke="#1E3A8A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Deep Blue Button Eyes */}
      <circle cx="46" cy="48" r="3.6" fill="#1E3A8A" />
      <circle cx="44.8" cy="46.8" r="1.2" fill="#FFFFFF" />
      <circle cx="74" cy="48" r="3.6" fill="#1E3A8A" />
      <circle cx="72.8" cy="46.8" r="1.2" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <ellipse cx="38" cy="56" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.45" />
      <ellipse cx="82" cy="56" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.45" />

      {/* Clapping / Waving Paws */}
      <ellipse
        cx="30"
        cy="78"
        rx="9"
        ry="7"
        fill="#F472B6"
        className={clapping ? 'animate-paw-left' : ''}
      />
      <ellipse
        cx="90"
        cy="78"
        rx="9"
        ry="7"
        fill="#F472B6"
        className={clapping ? 'animate-paw-right' : ''}
      />

      {/* Sparkle heart when clapping */}
      {clapping && (
        <path
          d="M60 22 C58 18, 52 18, 52 23 C52 27, 60 31, 60 31 C60 31, 68 27, 68 23 C68 18, 62 18, 60 22 Z"
          fill="#1E3A8A"
        />
      )}
    </svg>
  );
};

interface SetupSheetOverlayModalProps {
  onSaveUrl: (url: string) => void;
  onSkip: () => void;
}

export const SetupSheetOverlayModal: React.FC<SetupSheetOverlayModalProps> = ({
  onSaveUrl,
  onSkip,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSaveUrl(url.trim());
  };

  return (
    <div className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-blue-950/30 px-5 backdrop-blur-[3px]">
      <div className="animate-ios-pop w-full max-w-[360px] rounded-[32px] border border-pink-200 bg-gradient-to-b from-white via-pink-50/40 to-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex justify-center">
          <JellycatPlushSvg size={104} clapping={false} />
        </div>

        <span className="mt-1 inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[11px] font-extrabold text-blue-900">
          THIẾT LẬP BAN ĐẦU
        </span>
        <h3 className="mt-2 text-base font-extrabold text-blue-950">
          Chưa có URL Google Sheets
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Dán URL Google Apps Script của bạn vào đây để đồng bộ dữ liệu nhiều thiết bị nhé.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <input
            type="url"
            required
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full rounded-2xl border border-pink-200 bg-pink-50/40 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-blue-900 focus:bg-white"
          />
          <button
            type="submit"
            className="ios-press w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20"
          >
            Lưu & Kết nối
          </button>
        </form>

        <button
          type="button"
          onClick={onSkip}
          className="mt-2.5 w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
        >
          Để sau, dùng tạm Local
        </button>
      </div>
    </div>
  );
};

interface WelcomeOverlayModalProps {
  pendingTasks: Task[];
  initialDailyNote?: string;
  weatherTip?: string;
  onGoToTasks: (dailyNoteText: string) => void;
  onDismiss: (dailyNoteText: string) => void;
}

export const WelcomeOverlayModal: React.FC<WelcomeOverlayModalProps> = ({
  pendingTasks,
  initialDailyNote = '',
  weatherTip = '',
  onGoToTasks,
  onDismiss,
}) => {
  const [noteText, setNoteText] = useState(initialDailyNote);

  return (
    <div
      className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-blue-950/25 px-5 backdrop-blur-[3px]"
      onClick={() => onDismiss(noteText)}
    >
      <div
        className="animate-ios-pop relative w-full max-w-[350px] rounded-[32px] border border-pink-200 bg-gradient-to-b from-white via-pink-50/50 to-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onDismiss(noteText)}
          className="ios-press absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-slate-400 hover:text-blue-900"
          aria-label="Đóng nhắc nhở"
        >
          <GIcon name="close" size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <JellycatPlushSvg size={96} clapping={false} />
          <h3 className="mt-2 text-base font-extrabold text-blue-950">
            {pendingTasks.length > 0
              ? `Hôm nay còn ${pendingTasks.length} việc chưa xong nè`
              : 'Chào ngày mới tốt lành!'}
          </h3>
          {weatherTip && (
            <p className="mt-2 rounded-2xl border border-pink-100 bg-blue-50/60 px-3 py-2 text-[11px] font-semibold leading-relaxed text-blue-900">
              {weatherTip}
            </p>
          )}
        </div>

        {pendingTasks.length > 0 && (
          <ul className="mt-3 space-y-1.5 rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
            {pendingTasks.slice(0, 3).map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 truncate text-xs font-semibold text-slate-700"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-pink-400" />
                <span className="truncate">{t.title}</span>
              </li>
            ))}
            {pendingTasks.length > 3 && (
              <li className="text-[11px] font-bold text-pink-500">
                +{pendingTasks.length - 3} việc khác...
              </li>
            )}
          </ul>
        )}

        {/* Daily Note Input */}
        <div className="mt-3.5 text-left">
          <label className="block text-[11px] font-bold text-blue-900">
            Ghi chú cho hôm nay
          </label>
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Viết nhanh điều cần nhớ cho hôm nay..."
            className="mt-1 w-full resize-none rounded-2xl border border-pink-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-900"
          />
        </div>

        <button
          type="button"
          onClick={() => onGoToTasks(noteText)}
          className="ios-press mt-3.5 flex w-full items-center justify-center gap-1 rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20"
        >
          <span>{noteText.trim() ? 'Lưu & Đi xem task' : 'Đi xem task'}</span>
          <GIcon name="chevron_right" size={16} />
        </button>
      </div>
    </div>
  );
};

interface CelebrationMascotModalProps {
  completedCount: number;
  onClose: () => void;
}

export const CelebrationMascotModal: React.FC<CelebrationMascotModalProps> = ({
  completedCount,
  onClose,
}) => {
  return (
    <div
      className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-blue-950/25 px-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="animate-ios-pop w-full max-w-[340px] rounded-[32px] border border-pink-200 bg-gradient-to-b from-white via-pink-50/60 to-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex justify-center">
          <JellycatPlushSvg size={124} clapping={true} />
        </div>

        <span className="mt-2 inline-block rounded-full bg-pink-100 px-3 py-1 text-[11px] font-extrabold text-blue-900">
          HOÀN THÀNH 100%
        </span>
        <h3 className="mt-2.5 text-lg font-extrabold text-blue-950">
          Tuyệt vời quá đi!
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Bạn đã hoàn thành trọn vẹn cả <strong>{completedCount}</strong> công việc hôm nay. Nghỉ ngơi và tận hưởng nhé!
        </p>

        <button
          type="button"
          onClick={onClose}
          className="ios-press mt-5 w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/25"
        >
          Okay
        </button>
      </div>
    </div>
  );
};
