import React, { useRef, useState } from 'react';
import type { CoupleNudge, CoupleProfile, PartnerCheckin } from '../types/habit';
import { GIcon, TaskGlyph } from './GIcon';

interface CoupleViewProps {
  myPercent: number;
  profile: CoupleProfile;
  partnerCheckins: PartnerCheckin[];
  nudges: CoupleNudge[];
  onUpdateProfile: (next: CoupleProfile) => void;
  onReactCheckin: (id: string, reaction: 'heart' | 'clap' | 'fire') => void;
  onSendNudge: (message: string) => void;
}

const QUICK_NUDGES = [
  'Uống nước đi nè 💧',
  'Hoàn thành task đi nào ✨',
  'Nhớ ngủ sớm nha 🌙',
];

export const CoupleView: React.FC<CoupleViewProps> = ({
  myPercent,
  profile,
  partnerCheckins,
  nudges,
  onUpdateProfile,
  onReactCheckin,
  onSendNudge,
}) => {
  const [feedMode, setFeedMode] = useState<'swipe' | 'locket'>('swipe');
  const [cardIndex, setCardIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<'left' | 'right' | null>(null);
  const [heartBurst, setHeartBurst] = useState(false);
  const [customNudge, setCustomNudge] = useState('');
  const [showPairEdit, setShowPairEdit] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState(profile.partnerCode);

  const startXRef = useRef(0);

  const partnerPercent = 86;
  const coupleStreak = 5;

  const currentCard = partnerCheckins[cardIndex];

  const advanceCard = (dir: 'left' | 'right') => {
    setFlyDir(dir);
    if (dir === 'right' && currentCard) {
      onReactCheckin(currentCard.id, 'heart');
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 650);
    }
    setTimeout(() => {
      setFlyDir(null);
      setDragX(0);
      setCardIndex((i) => i + 1);
    }, 280);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 85) {
      advanceCard('right');
    } else if (dragX < -85) {
      advanceCard('left');
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* Couple % Comparison & Streak Card */}
      <div className="rounded-[26px] border border-pink-200/80 bg-gradient-to-br from-white via-pink-50/50 to-blue-50/40 p-4 shadow-[0_8px_28px_-8px_rgba(30,58,138,0.14)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
              COUPLE STREAK • {coupleStreak} NGÀY
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-blue-950">
              {profile.myName} & {profile.partnerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowPairEdit((v) => !v)}
            className="ios-press rounded-full border border-pink-200 bg-white px-3 py-1 text-[11px] font-bold text-blue-900"
          >
            Mã: {profile.myCode}
          </button>
        </div>

        {/* Pair code editor */}
        {showPairEdit && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-pink-100 bg-white p-2.5">
            <input
              type="text"
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
              placeholder="Nhập mã ghép đôi (VD: DL-9104)"
              className="flex-1 rounded-xl bg-pink-50/50 px-3 py-1.5 text-xs font-bold text-blue-950 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                onUpdateProfile({
                  ...profile,
                  partnerCode: partnerCodeInput,
                  isPaired: true,
                });
                setShowPairEdit(false);
              }}
              className="ios-press rounded-xl bg-blue-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              Ghép đôi
            </button>
          </div>
        )}

        {/* Side-by-side % bars */}
        <div className="mt-3.5 space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-pink-600">{profile.myName}</span>
              <span className="text-blue-950">{myPercent}%</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-pink-400 transition-all duration-500"
                style={{ width: `${myPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-blue-900">{profile.partnerName}</span>
              <span className="text-blue-950">{partnerPercent}%</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-900 transition-all duration-500"
                style={{ width: `${partnerPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Nudge / Poke Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
          <GIcon name="notifications_active" size={16} className="text-pink-500" />
          <span>Chọc / Nhắc nhẹ {profile.partnerName}</span>
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_NUDGES.map((msg) => (
            <button
              key={msg}
              type="button"
              onClick={() => onSendNudge(msg)}
              className="ios-press shrink-0 rounded-full border border-pink-200 bg-pink-50/60 px-3 py-1.5 text-[11px] font-bold text-blue-900 hover:bg-pink-100"
            >
              {msg}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            value={customNudge}
            onChange={(e) => setCustomNudge(e.target.value)}
            placeholder="Nhắn riêng cho người ấy..."
            className="flex-1 rounded-xl border border-pink-100 bg-pink-50/30 px-3 py-1.5 text-xs outline-none focus:border-blue-900"
          />
          <button
            type="button"
            onClick={() => {
              if (!customNudge.trim()) return;
              onSendNudge(customNudge.trim());
              setCustomNudge('');
            }}
            className="ios-press rounded-xl bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white"
          >
            Gửi
          </button>
        </div>

        {nudges.length > 0 && (
          <p className="mt-2 text-[11px] font-medium text-pink-500">
            Mới nhất: "{nudges[0].message}" ({nudges[0].createdAt})
          </p>
        )}
      </div>

      {/* Mode Switcher: Tinder Swipe vs Locket Vertical Feed */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-pink-100 bg-white p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setFeedMode('swipe')}
          className={`ios-press flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
            feedMode === 'swipe'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-blue-900'
          }`}
        >
          <GIcon name="view_carousel" size={16} />
          Quẹt ảnh (Tinder)
        </button>
        <button
          type="button"
          onClick={() => setFeedMode('locket')}
          className={`ios-press flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
            feedMode === 'locket'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-blue-900'
          }`}
        >
          <GIcon name="photo_camera" size={16} />
          Lướt dọc (Locket)
        </button>
      </div>

      {/* TINDER SWIPE STACK */}
      {feedMode === 'swipe' && (
        <div className="relative">
          {heartBurst && (
            <div className="animate-ios-pop pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-full bg-pink-500/90 p-5 text-white shadow-2xl">
                <GIcon name="favorite" size={44} />
              </div>
            </div>
          )}

          {currentCard ? (
            <div className="space-y-3">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  transform:
                    flyDir === 'right'
                      ? 'translateX(120%) rotate(18deg)'
                      : flyDir === 'left'
                        ? 'translateX(-120%) rotate(-18deg)'
                        : `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 340ms cubic-bezier(0.32, 0.72, 0, 1), opacity 300ms',
                  opacity: flyDir ? 0 : 1,
                }}
                className="relative cursor-grab touch-pan-y overflow-hidden rounded-[28px] border border-pink-200 bg-white shadow-xl active:cursor-grabbing"
              >
                <img
                  src={currentCard.photo}
                  alt={currentCard.taskTitle}
                  className="h-72 w-full object-cover pointer-events-none"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TaskGlyph value={currentCard.emoji} size={20} color={currentCard.color} />
                      <h3 className="text-sm font-extrabold text-blue-950">
                        {currentCard.taskTitle}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-pink-500">
                      {currentCard.completedAt}
                    </span>
                  </div>
                  {currentCard.note && (
                    <p className="mt-1.5 text-xs text-slate-600">
                      "{currentCard.note}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons below card */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  type="button"
                  onClick={() => advanceCard('left')}
                  className="ios-press flex h-13 w-13 items-center justify-center rounded-full border border-pink-200 bg-white text-slate-500 shadow-md"
                  title="Bỏ qua / Thẻ tiếp"
                >
                  <GIcon name="close" size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => advanceCard('right')}
                  className="ios-press flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-300/40"
                  title="Thả tim khen ngợi"
                >
                  <GIcon name="favorite" size={28} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReactCheckin(currentCard.id, 'clap');
                    advanceCard('right');
                  }}
                  className="ios-press flex h-13 w-13 items-center justify-center rounded-full border border-blue-200 bg-blue-900 text-white shadow-md"
                  title="Tuyệt vời!"
                >
                  <GIcon name="auto_awesome" size={22} />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[26px] border border-pink-100 bg-white p-8 text-center shadow-2xs">
              <p className="text-sm font-extrabold text-blue-950">
                Đã xem hết ảnh check-in hôm nay!
              </p>
              <button
                type="button"
                onClick={() => setCardIndex(0)}
                className="ios-press mt-3 rounded-full bg-blue-900 px-4 py-2 text-xs font-bold text-white"
              >
                Xem lại từ đầu
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOCKET VERTICAL FEED */}
      {feedMode === 'locket' && (
        <div className="space-y-4">
          {partnerCheckins.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-pink-200 bg-white shadow-[0_8px_28px_-8px_rgba(30,58,138,0.14)]"
            >
              <img
                src={item.photo}
                alt={item.taskTitle}
                className="h-64 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TaskGlyph value={item.emoji} size={20} color={item.color} />
                    <span className="text-sm font-extrabold text-blue-950">
                      {item.taskTitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-pink-500">
                    {item.completedAt}
                  </span>
                </div>
                {item.note && (
                  <p className="mt-1.5 text-xs text-slate-600">"{item.note}"</p>
                )}

                <div className="mt-3 flex gap-2">
                  {(
                    [
                      { id: 'heart', label: '❤️ Thả tim' },
                      { id: 'clap', label: '👏 Giỏi quá' },
                      { id: 'fire', label: '🔥 Đỉnh' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onReactCheckin(item.id, r.id)}
                      className={`ios-press rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        item.reaction === r.id
                          ? 'bg-blue-900 text-white'
                          : 'bg-pink-50 text-blue-950 hover:bg-pink-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
