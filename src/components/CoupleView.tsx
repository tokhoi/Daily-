import React, { useRef, useState } from 'react';
import { STICKER_BY_ID } from '../constants/stickers';
import type {
  CoupleNudge,
  CoupleProfile,
  PairRequest,
  PartnerCheckin,
} from '../types/habit';
import { GIcon, TaskGlyph } from './GIcon';

interface CoupleViewProps {
  profile: CoupleProfile;
  pairError?: string | null;
  incomingRequest?: PairRequest | null;
  outgoingRequest?: PairRequest | null;
  partnerCheckins: PartnerCheckin[];
  nudges: CoupleNudge[];
  onUpdateProfile: (next: CoupleProfile) => void;
  onSendPairRequest?: (partnerCode: string) => void;
  onRespondPairRequest?: (requestId: string, accept: boolean) => void;
  onCancelPairRequest?: (requestId: string) => void;
  onReactCheckin: (id: string, reaction: 'heart' | 'clap' | 'fire') => void;
  onSendNudge: (message: string) => void;
}

const QUICK_NUDGES = [
  'Uống nước đi nè 💧',
  'Hoàn thành task đi nào ✨',
  'Nhớ ngủ sớm nha 🌙',
];

export const CoupleView: React.FC<CoupleViewProps> = ({
  profile,
  pairError,
  incomingRequest,
  outgoingRequest,
  partnerCheckins,
  nudges,
  onUpdateProfile,
  onSendPairRequest,
  onRespondPairRequest,
  onCancelPairRequest,
  onReactCheckin,
  onSendNudge,
}) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDir, setFlyDir] = useState<'left' | 'right' | null>(null);
  const [heartBurst, setHeartBurst] = useState(false);
  const [customNudge, setCustomNudge] = useState('');
  const [showPairEdit, setShowPairEdit] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState(profile.partnerCode);
  const [partnerNameInput, setPartnerNameInput] = useState(profile.partnerName);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  const startXRef = useRef(0);

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

  const handleCreateRoom = () => {
    const randomCode = `RM-${Math.floor(1000 + Math.random() * 9000)}`;
    onUpdateProfile({
      ...profile,
      partnerName: partnerNameInput.trim(),
      partnerCode: randomCode,
      isPaired: false,
    });
  };

  const handleJoinRoom = () => {
    const code = joinRoomInput.trim().toUpperCase();
    if (!code) return;
    if (onSendPairRequest) {
      onSendPairRequest(code);
      return;
    }
    onUpdateProfile({
      ...profile,
      partnerName: partnerNameInput.trim(),
      partnerCode: code,
      isPaired: true,
    });
  };

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyMyCode = () => {
    navigator.clipboard?.writeText(profile.myCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  if (!profile.isPaired) {
    return (
      <div className="animate-ios-page flex min-h-[68vh] flex-col items-center justify-center px-2 pb-6">
        <div className="w-full rounded-[30px] border border-pink-100 bg-white p-6 shadow-[0_12px_36px_-12px_rgba(30,58,138,0.12)]">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-pink-50 text-pink-500">
              <GIcon name="favorite" size={28} />
            </span>
            <h2 className="mt-3 text-base font-extrabold text-blue-950">
              Liên kết Couple
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Chia sẻ mã của bạn hoặc nhập mã của người ấy để vào không gian Couple.
            </p>
          </div>

          {incomingRequest && (
            <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50/80 p-4 text-center">
              <p className="text-xs font-extrabold text-blue-950">
                💌 Lời mời ghép đôi từ {incomingRequest.from_name}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                @{incomingRequest.from_user_id} muốn kết nối phòng Couple với bạn
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onRespondPairRequest?.(incomingRequest.id, false)}
                  className="ios-press flex-1 rounded-xl border border-pink-200 bg-white py-2 text-xs font-bold text-slate-600"
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => onRespondPairRequest?.(incomingRequest.id, true)}
                  className="ios-press flex-1 rounded-xl bg-blue-900 py-2 text-xs font-extrabold text-white shadow-sm"
                >
                  Chấp nhận & Vào phòng
                </button>
              </div>
            </div>
          )}

          {outgoingRequest && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
              <p className="text-xs font-extrabold text-blue-950">
                ⏳ Đang chờ {outgoingRequest.to_code} xác nhận...
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Khi người ấy bấm Chấp nhận, hai bạn sẽ cùng vào phòng ngay lập tức.
              </p>
              <button
                type="button"
                onClick={() => onCancelPairRequest?.(outgoingRequest.id)}
                className="ios-press mt-3 rounded-xl bg-white px-4 py-1.5 text-[11px] font-bold text-rose-500 shadow-2xs"
              >
                Hủy lời mời
              </button>
            </div>
          )}

          {profile.partnerCode.startsWith('RM-') && !outgoingRequest && (
            <div className="mt-4 rounded-2xl bg-blue-50/60 p-3 text-center text-xs font-bold text-blue-900">
              Đang chờ người ấy vào phòng {profile.partnerCode}
            </div>
          )}
          {pairError && <p role="alert" className="mt-3 text-center text-xs font-semibold text-rose-600">{pairError}</p>}
          {/* Your Code */}
          <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-3.5 text-center">
            <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Mã của bạn
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-lg font-extrabold tracking-widest text-blue-950">
                {profile.myCode}
              </span>
              <button
                type="button"
                onClick={handleCopyMyCode}
                className="ios-press flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-pink-500 shadow-2xs"
              >
                <GIcon name={copiedCode ? 'check' : 'content_copy'} size={13} />
                {copiedCode ? 'Đã copy' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Partner Name + Code Input */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                Tên người ấy
              </label>
              <input
                type="text"
                value={partnerNameInput}
                onChange={(e) => setPartnerNameInput(e.target.value)}
                placeholder="vd: Gia Hân"
                className="w-full rounded-2xl border border-pink-100 bg-pink-50/30 px-3.5 py-2.5 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                Nhập mã của người ấy
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinRoomInput}
                  onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                  placeholder="vd: DL-9104"
                  className="flex-1 rounded-2xl border border-pink-100 bg-pink-50/30 px-3.5 py-2.5 text-xs font-bold text-blue-950 uppercase outline-hidden focus:border-pink-300"
                />
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="ios-press rounded-2xl bg-blue-900 px-4 text-xs font-extrabold text-white"
                >
                  Kết nối
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              className="ios-press w-full rounded-2xl border border-pink-200 bg-pink-50/60 py-2.5 text-xs font-bold text-blue-950"
            >
              Hoặc tạo mã Room Couple mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* Couple % Comparison & Streak Card */}
      <div className="rounded-[26px] border border-pink-200/80 bg-gradient-to-br from-white via-pink-50/50 to-blue-50/40 p-4 shadow-[0_8px_28px_-8px_rgba(30,58,138,0.14)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img
              src={STICKER_BY_ID.love.src}
              alt="Couple Sticker"
              className="h-11 w-11 shrink-0 rounded-2xl object-contain drop-shadow-2xs"
            />
            <div>
              <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
                PHÒNG COUPLE • {profile.partnerCode || profile.myCode}
              </span>
              <h2 className="mt-1 text-sm font-extrabold text-blue-950">
                {profile.myName} & {profile.partnerName}
              </h2>
            </div>
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
              Lưu mã
            </button>
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="ios-press rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-500"
            >
              Rời room
            </button>
          </div>
        )}

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

      {/* Swipe Card Stack */}
      <div className="relative">
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950">
            <GIcon name="photo_camera" size={16} className="text-pink-500" />
            <span>Khoảnh khắc check-in</span>
          </div>
          {partnerCheckins.length > 0 && currentCard && (
            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-bold text-pink-500">
              {Math.min(cardIndex + 1, partnerCheckins.length)} / {partnerCheckins.length}
            </span>
          )}
        </div>

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
              {dragX > 28 && (
                <div className="pointer-events-none absolute top-4 left-4 z-20 -rotate-12 rounded-xl border-2 border-pink-400 bg-white/90 px-3 py-1 text-xs font-extrabold text-pink-500 shadow-sm">
                  THẢ TIM ❤️
                </div>
              )}
              {dragX < -28 && (
                <div className="pointer-events-none absolute top-4 right-4 z-20 rotate-12 rounded-xl border-2 border-slate-400 bg-white/90 px-3 py-1 text-xs font-extrabold text-slate-600 shadow-sm">
                  BỎ QUA
                </div>
              )}
              <img
                src={currentCard.photo}
                alt={currentCard.taskTitle}
                className="pointer-events-none h-72 w-full object-cover"
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
        ) : partnerCheckins.length === 0 ? (
          <div className="rounded-[26px] border border-pink-100 bg-white p-8 text-center shadow-2xs">
            <p className="text-sm font-extrabold text-blue-950">
              Chưa có ảnh check-in nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Khi hoàn thành việc kèm ảnh, khoảnh khắc check-in sẽ xuất hiện tại đây!
            </p>
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

      {/* Confirm Leave Room Modal */}
      {showLeaveConfirm && (
        <div className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
          <div className="animate-ios-sheet w-full max-w-[340px] rounded-[28px] border border-pink-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <GIcon name="logout" size={20} />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-blue-950">
                  Xác nhận rời phòng?
                </h3>
                <p className="text-[11px] font-medium text-slate-400">
                  Phòng Couple • {profile.partnerCode}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Bạn có chắc muốn rời khỏi phòng cùng{' '}
              <span className="font-bold text-blue-950">{profile.partnerName}</span> không?
              Hệ thống sẽ gửi thông báo về cho {profile.partnerName} biết bạn đã rời room.
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="ios-press flex-1 rounded-2xl border border-pink-100 bg-pink-50/60 py-2.5 text-xs font-bold text-blue-950"
              >
                Ở lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setShowPairEdit(false);
                  onUpdateProfile({
                    ...profile,
                    partnerCode: '',
                    isPaired: false,
                  });
                }}
                className="ios-press flex-1 rounded-2xl bg-rose-500 py-2.5 text-xs font-extrabold text-white shadow-sm"
              >
                Xác nhận rời room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
