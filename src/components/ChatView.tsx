import React, { useEffect, useRef, useState } from 'react';
import type { CoupleChatMessage, CoupleProfile } from '../types/habit';
import { STICKER_BY_ID, STICKER_PACK, parseStickerToken } from '../constants/stickers';
import { GIcon } from './GIcon';

interface ChatViewProps {
  profile: CoupleProfile;
  chatMessages: CoupleChatMessage[];
  chatError?: string | null;
  onSendChat: (text: string) => void;
  onGoToCouple: () => void;
}

const QUICK_COUPLE_CHAT = [
  'Cố lên nha 💪',
  'Xong task rồi nè!',
  'Tối nay đi ăn nhé 🍜',
  'Nhớ cậu 💕',
];

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  chatMessages,
  chatError,
  onSendChat,
  onGoToCouple,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleSend = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    onSendChat(content);
    if (!textToSend) setChatInput('');
  };

  if (!profile.isPaired) {
    return (
      <div className="animate-ios-page flex min-h-[68vh] flex-col items-center justify-center px-2 pb-6">
        <div className="w-full rounded-[30px] border border-pink-100 bg-white p-6 text-center shadow-[0_12px_36px_-12px_rgba(30,58,138,0.12)]">
          <img
            src={STICKER_BY_ID.love.src}
            alt="Sticker Couple"
            className="mx-auto h-24 w-24 rounded-3xl object-contain drop-shadow-sm"
          />
          <h2 className="mt-3 text-base font-extrabold text-blue-950">
            Chưa kết nối phòng chat
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Hãy liên kết Couple với người ấy trước để mở khung nhắn tin riêng tư.
          </p>
          <button
            type="button"
            onClick={onGoToCouple}
            className="ios-press mt-4 w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20"
          >
            Đi tới Liên kết Couple
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-ios-page flex h-[calc(100vh-175px)] min-h-[440px] flex-col rounded-[26px] border border-pink-100/90 bg-white/95 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-pink-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-blue-900 text-xs font-extrabold text-white">
            {profile.partnerName.trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-blue-950">
              {profile.partnerName}
            </h2>
            <p className="text-[10px] font-semibold text-slate-400">
              Phòng {profile.partnerCode || profile.myCode}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          Đang kết nối
        </span>
      </div>

      {/* Messages List */}
      <div className="my-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <img
              src={STICKER_BY_ID.wave.src}
              alt="Sticker Chào"
              className="animate-plush-bounce h-24 w-24 rounded-3xl object-contain drop-shadow-sm"
            />
            <p className="mt-2.5 text-xs font-bold text-blue-950">
              Chưa có tin nhắn nào
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Gửi lời chào, sticker hoặc chọn câu nhắn nhanh bên dưới nhé!
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const sticker = parseStickerToken(msg.text);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'me' ? 'items-end' : 'items-start'
                }`}
              >
                {sticker ? (
                  <div className="p-1">
                    <img
                      src={sticker.src}
                      alt={sticker.label}
                      className="h-28 w-28 rounded-3xl object-contain drop-shadow-[0_6px_14px_rgba(244,114,182,0.28)]"
                    />
                  </div>
                ) : (
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium ${
                      msg.sender === 'me'
                        ? 'rounded-br-sm bg-blue-900 text-white'
                        : 'rounded-bl-sm bg-pink-50 text-blue-950'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                <span className="mt-0.5 px-1 text-[10px] text-slate-400">
                  {msg.sender === 'me' ? profile.myName : profile.partnerName}
                  {msg.createdAt ? ` • ${msg.createdAt}` : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
        {QUICK_COUPLE_CHAT.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleSend(q)}
            className="ios-press shrink-0 rounded-full border border-pink-100 bg-pink-50/70 px-3 py-1 text-[11px] font-semibold text-blue-900"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Sticker Picker Drawer */}
      {showStickers && (
        <div className="mb-2.5 grid grid-cols-3 gap-2 rounded-2xl border border-pink-100 bg-pink-50/50 p-2.5">
          {STICKER_PACK.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                handleSend(s.token);
                setShowStickers(false);
              }}
              className="ios-press flex flex-col items-center gap-1 rounded-xl bg-white p-1.5 shadow-2xs transition hover:bg-pink-50"
            >
              <img
                src={s.src}
                alt={s.label}
                className="h-14 w-14 rounded-xl object-contain"
              />
              <span className="text-[10px] font-bold text-blue-950">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      {chatError && <p role="alert" className="mb-2 text-xs font-semibold text-rose-600">{chatError}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowStickers((v) => !v)}
          className={`ios-press flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${
            showStickers
              ? 'border-pink-300 bg-pink-100 text-pink-600'
              : 'border-pink-100 bg-pink-50/60 text-pink-500'
          }`}
          title="Gửi Sticker"
          aria-label="Gửi Sticker"
        >
          <GIcon name="mood" size={20} />
        </button>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={`Nhắn cho ${profile.partnerName}...`}
          className="flex-1 rounded-2xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-medium text-blue-950 outline-hidden focus:border-pink-300"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          className="ios-press rounded-2xl bg-blue-900 px-4 text-xs font-bold text-white"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};
