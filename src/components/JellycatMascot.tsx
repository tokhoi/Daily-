import React from 'react';
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

interface WelcomeMascotBannerProps {
  pendingTasks: Task[];
  onGoToTasks: () => void;
  onDismiss: () => void;
}

export const WelcomeMascotBanner: React.FC<WelcomeMascotBannerProps> = ({
  pendingTasks,
  onGoToTasks,
  onDismiss,
}) => {
  if (pendingTasks.length === 0) return null;

  return (
    <div className="animate-ios-page relative overflow-hidden rounded-[26px] border border-pink-200/80 bg-gradient-to-br from-white via-pink-50/70 to-blue-50/40 p-4 shadow-[0_8px_28px_-8px_rgba(30,58,138,0.14)]">
      <button
        type="button"
        onClick={onDismiss}
        className="ios-press absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 hover:text-blue-900"
        aria-label="Đóng nhắc nhở"
      >
        <GIcon name="close" size={16} />
      </button>

      <div className="flex items-center gap-3">
        <JellycatPlushSvg size={76} clapping={false} />
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-xs font-extrabold text-blue-900">
            Chào bạn! Còn {pendingTasks.length} việc chưa xong nè
          </p>
          <ul className="mt-1.5 space-y-1">
            {pendingTasks.slice(0, 3).map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-1.5 truncate text-[11px] font-medium text-slate-600"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
                <span className="truncate">{t.title}</span>
              </li>
            ))}
            {pendingTasks.length > 3 && (
              <li className="text-[10px] font-semibold text-pink-500">
                +{pendingTasks.length - 3} việc khác...
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={onGoToTasks}
            className="ios-press mt-2.5 inline-flex items-center gap-1 rounded-full bg-blue-900 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-blue-900/20"
          >
            <span>Đi xem task</span>
            <GIcon name="chevron_right" size={15} />
          </button>
        </div>
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
