import React, { useState } from 'react';
import { GIcon } from './GIcon';
import stickerWave from '../assets/stickers/sticker_wave.jpg';
import stickerClap from '../assets/stickers/sticker_clap.jpg';
import stickerLove from '../assets/stickers/sticker_love.jpg';
import stickerChill from '../assets/stickers/sticker_chill.jpg';
import stickerSleep from '../assets/stickers/sticker_sleep.jpg';
import stickerCry from '../assets/stickers/sticker_cry.jpg';

export type Bear3DAnim =
  | 'idle'
  | 'clap'
  | 'wave'
  | 'poke'
  | 'dance'
  | 'sleep'
  | 'flex'
  | 'cry'
  | 'heart_pose'
  | 'dab'
  | 'surprised'
  | 'shy'
  | 'think'
  | 'cheer';

export type Bear3DVariant = 'pink' | 'blue';

const STICKER_SRC_MAP: Record<Bear3DAnim, string> = {
  idle: stickerChill,
  think: stickerChill,
  wave: stickerWave,
  poke: stickerWave,
  cheer: stickerWave,
  clap: stickerClap,
  dance: stickerClap,
  flex: stickerClap,
  dab: stickerClap,
  heart_pose: stickerLove,
  shy: stickerLove,
  sleep: stickerSleep,
  cry: stickerCry,
  surprised: stickerCry,
};

const STICKER_MOTION_MAP: Record<Bear3DAnim, string> = {
  idle: 'animate-plush-bounce',
  think: 'animate-plush-bounce',
  wave: 'animate-bounce',
  poke: 'animate-bounce',
  cheer: 'animate-bounce',
  clap: 'animate-plush-bounce',
  dance: 'animate-bounce',
  flex: 'animate-pulse',
  dab: 'animate-plush-bounce',
  heart_pose: 'animate-pulse',
  shy: 'animate-plush-bounce',
  sleep: 'animate-pulse',
  cry: 'animate-plush-bounce',
  surprised: 'animate-bounce',
};

interface Bear3DCanvasProps {
  anim: Bear3DAnim;
  variant: Bear3DVariant;
  height?: number;
  onTapBear?: () => void;
}

/**
 * 2D Cartoon Sticker Mascot display (replaces the previous 3D bear canvas).
 * Keeps the exported component name `Bear3DCanvas` for drop-in compatibility.
 */
export const Bear3DCanvas: React.FC<Bear3DCanvasProps> = ({
  anim,
  variant,
  height = 240,
  onTapBear,
}) => {
  const [popped, setPopped] = useState(false);
  const src = STICKER_SRC_MAP[anim] || stickerWave;
  const motionClass = STICKER_MOTION_MAP[anim] || 'animate-plush-bounce';

  const handleTap = () => {
    setPopped(true);
    setTimeout(() => setPopped(false), 450);
    onTapBear?.();
  };

  const imgSize = Math.max(120, Math.min(height - 20, 230));

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTap();
      }}
      style={{ height }}
      className={`relative flex w-full cursor-pointer select-none items-center justify-center overflow-hidden rounded-[26px] transition ${
        variant === 'blue'
          ? 'bg-gradient-to-b from-sky-50/70 via-blue-50/40 to-white/60'
          : 'bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-white/60'
      }`}
      aria-label="Sticker 2D tương tác"
    >
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${
          popped ? 'scale-110 -rotate-3' : 'hover:scale-105'
        } ${motionClass}`}
      >
        <img
          src={src}
          alt={`Sticker ${anim}`}
          style={{
            width: imgSize,
            height: imgSize,
            filter: variant === 'blue' ? 'hue-rotate(195deg) saturate(0.95)' : undefined,
          }}
          className="rounded-[28px] object-contain drop-shadow-[0_12px_22px_rgba(244,114,182,0.28)]"
          draggable={false}
        />
        {popped && (
          <span className="pointer-events-none absolute -top-2 -right-2 animate-ping text-lg">
            💖
          </span>
        )}
      </div>
    </div>
  );
};

const ANIM_PRESETS: {
  id: Bear3DAnim;
  label: string;
  meme: string;
  icon: string;
}[] = [
  { id: 'idle', label: 'Trà sữa chill', meme: 'Chill phết, làm ly trà sữa hông? 🧋', icon: 'pets' },
  { id: 'clap', label: 'Đỉnh nóc', meme: 'Đỉnh nóc, kịch trần, bay phấp phới! 🔥', icon: 'favorite' },
  { id: 'wave', label: 'Vẫy chào', meme: 'Hello cưng, nay tick đủ task chưa đó? 👋', icon: 'wb_sunny' },
  { id: 'poke', label: 'Chọc nhắc', meme: 'Dậy làm việc đi bạn ơi, đừng lười nữa!! 🔔', icon: 'notifications_active' },
  { id: 'dance', label: 'Quẩy meme', meme: 'Gét gô!! Hết nước chấm luôn 💃✨', icon: 'auto_awesome' },
  { id: 'sleep', label: 'Oải chưởng', meme: 'Oải cả chưởng... cho bé ngủ xíu 💤', icon: 'bedtime' },
  { id: 'flex', label: 'Flex nhẹ', meme: 'Over hợp luôn! Quá đỉnh quá uy tín 💪', icon: 'fitness_center' },
  { id: 'cry', label: 'Tụt mood', meme: 'Cứu bé với, deadline dí quá trời 😭', icon: 'rainy' },
  { id: 'heart_pose', label: 'Bắn tim', meme: 'Mãi keo nha, yêu cậu x1000 🫶💖', icon: 'favorite' },
  { id: 'dab', label: 'Slay hết nấc', meme: 'Slayyyy! Không làm mà đòi có ăn thì... 😎', icon: 'flag' },
  { id: 'surprised', label: 'Ủa, bất ngờ!', meme: 'Ủa gì vậy trời, bất ngờ thiệt đó! 😲', icon: 'auto_awesome' },
  { id: 'shy', label: 'Ngại quá đi', meme: 'Được khen cái ngại ngang luôn á 🥰', icon: 'favorite' },
  { id: 'think', label: 'Để nghĩ xíu', meme: 'Hmm, để bé suy nghĩ cùng bạn nha 🤔', icon: 'edit_note' },
  { id: 'cheer', label: 'Cổ vũ bạn', meme: 'Bạn làm được mà! Cổ vũ hết mình nè 📣', icon: 'wb_sunny' },
];

interface BearChatMessage {
  id: string;
  sender: 'user' | 'bear';
  text: string;
  time: string;
}

const QUICK_CHAT_PROMPTS = [
  'Đỉnh nóc kịch trần!',
  'Gét gô quẩy lên',
  'Oải cả chưởng quá',
  'Bắn tim đi nè',
  'Deadline dí quá cứu bé',
  'Ngại quá đi à',
];

function getBearReply(text: string): { reply: string; anim: Bear3DAnim } {
  const lower = text.toLowerCase();
  if (lower.includes('ngủ') || lower.includes('mệt') || lower.includes('oải')) {
    return { reply: 'Oải cả chưởng thì nghỉ xíu đi bạn hiền, bé canh giấc cho 💤', anim: 'sleep' };
  }
  if (lower.includes('cứu') || lower.includes('deadline') || lower.includes('khóc') || lower.includes('buồn')) {
    return { reply: 'Á à tụt mood hả 😭 Thở sâu 3 cái rồi bé cổ vũ bạn làm tiếp nha!', anim: 'cry' };
  }
  if (lower.includes('ngại') || lower.includes('xấu hổ') || lower.includes('thẹn')) {
    return { reply: 'Được khen cái ngại ngang luôn á 🥰', anim: 'shy' };
  }
  if (lower.includes('bất ngờ') || lower.includes('ngạc nhiên') || lower.includes('ủa') || lower.includes('wow')) {
    return { reply: 'Ủa gì vậy trời, bất ngờ thiệt đó! 😲', anim: 'surprised' };
  }
  if (lower.includes('nghĩ') || lower.includes('phân vân') || lower.includes('suy nghĩ')) {
    return { reply: 'Hmm, để bé suy nghĩ cùng bạn nha 🤔', anim: 'think' };
  }
  if (lower.includes('cổ vũ') || lower.includes('động viên') || lower.includes('cố lên') || lower.includes('nản')) {
    return { reply: 'Bạn làm được mà! Cổ vũ hết mình nè 📣', anim: 'cheer' };
  }
  if (lower.includes('tim') || lower.includes('yêu') || lower.includes('keo')) {
    return { reply: 'Bắn tim chéo chéo!! Mãi keo nha bạn tui 🫶💖', anim: 'heart_pose' };
  }
  if (lower.includes('flex') || lower.includes('cơ') || lower.includes('mạnh')) {
    return { reply: 'Over hợp luôn đúng hông 💪😎', anim: 'flex' };
  }
  if (lower.includes('slay') || lower.includes('dab') || lower.includes('ngầu')) {
    return { reply: 'Slayyy hết nấc! 10 điểm không có nhưng 😎✨', anim: 'dab' };
  }
  if (lower.includes('gét gô') || lower.includes('nhảy') || lower.includes('quẩy')) {
    return { reply: 'Gét gô!! Hết nước chấm luôn bạn ơi 💃🔥', anim: 'dance' };
  }
  if (lower.includes('đỉnh') || lower.includes('100%') || lower.includes('xong') || lower.includes('giỏi')) {
    return { reply: 'Đỉnh nóc, kịch trần, bay phấp phới!! Vỗ tay rào rào 👏💗', anim: 'clap' };
  }
  if (lower.includes('nhắc') || lower.includes('chọc') || lower.includes('task')) {
    return { reply: 'Dậy hoàn thành việc hôm nay đi bạn ơi, lướt điện thoại hoài à 🔔😂', anim: 'poke' };
  }
  if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
    return { reply: 'Hello cưng! Chúc hôm nay năng suất gấp đôi hôm qua nha ☀️', anim: 'wave' };
  }
  return {
    reply: 'Nghe uy tín phết! Làm ngụm trà sữa rồi chiến tiếp nha 🧋✨',
    anim: 'idle',
  };
}

export const Bear3DStudio: React.FC = () => {
  const [anim, setAnim] = useState<Bear3DAnim>('wave');
  const [variant, setVariant] = useState<Bear3DVariant>('pink');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<BearChatMessage[]>([
    {
      id: 'welcome_sticker',
      sender: 'bear',
      text: 'Hello cưng! Bộ sticker hoạt hình 2D mới tinh đã sẵn sàng rồi nè ✨🐰',
      time: 'Bây giờ',
    },
  ]);

  const activePreset = ANIM_PRESETS.find((p) => p.id === anim);
  const latestBearMsg =
    [...messages].reverse().find((m) => m.sender === 'bear')?.text || activePreset?.meme;

  const handleSelectAnim = (preset: (typeof ANIM_PRESETS)[number]) => {
    setAnim(preset.id);
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-14),
      { id: `meme_${Date.now()}`, sender: 'bear', text: preset.meme, time: now },
    ]);
  };

  const handleSendChat = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { reply, anim: nextAnim } = getBearReply(content);
    setAnim(nextAnim);
    setMessages((prev) => [
      ...prev.slice(-14),
      { id: `u_${Date.now()}`, sender: 'user', text: content, time: now },
      { id: `b_${Date.now() + 1}`, sender: 'bear', text: reply, time: now },
    ]);
    if (!textToSend) setChatInput('');
  };

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      <div className="relative overflow-hidden rounded-[28px] border border-pink-200/80 bg-gradient-to-b from-white via-pink-50/50 to-blue-50/40 p-4 shadow-[0_10px_32px_-10px_rgba(30,58,138,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
              STICKER HOẠT HÌNH 2D
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-blue-950">
              Bé Sticker Tương Tác
            </h2>
          </div>

          <div className="flex gap-1.5 rounded-2xl bg-pink-50/90 p-1">
            <button
              type="button"
              onClick={() => setVariant('pink')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'pink' ? 'bg-pink-400 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Hồng Pastel
            </button>
            <button
              type="button"
              onClick={() => setVariant('blue')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'blue' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Xanh Pastel
            </button>
          </div>
        </div>

        {latestBearMsg && (
          <div className="mt-2.5 rounded-2xl border border-pink-100 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-blue-950 shadow-xs">
            {latestBearMsg}
          </div>
        )}

        <div className="mt-2.5">
          <Bear3DCanvas anim={anim} variant={variant} height={265} />
        </div>

        <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
          Chạm vào sticker để thả tim hoặc chọn biểu cảm bên dưới
        </p>
      </div>

      {/* Actions & Meme Grid */}
      <div className="rounded-[24px] border border-pink-100/90 bg-white/90 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
        <h3 className="mb-3 text-xs font-extrabold tracking-wide text-blue-950 uppercase">
          Bộ Sticker &amp; Biểu Cảm
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ANIM_PRESETS.map((preset) => {
            const active = anim === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectAnim(preset)}
                className={`ios-press flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-pink-300 bg-pink-100/80 text-blue-950 shadow-xs'
                    : 'border-pink-100 bg-white text-slate-600 hover:border-pink-200'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    active ? 'bg-blue-900 text-white' : 'bg-pink-50 text-pink-400'
                  }`}
                >
                  <GIcon name={preset.icon} size={16} />
                </span>
                <span className="text-xs font-bold">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Box with Sticker Mascot */}
      <div className="rounded-[24px] border border-pink-100/90 bg-white/90 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wide text-blue-950 uppercase">
            Khung Chat với Bé Sticker
          </h3>
          <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-500">
            Trực tuyến
          </span>
        </div>

        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium ${
                  msg.sender === 'user'
                    ? 'rounded-br-sm bg-blue-900 text-white'
                    : 'rounded-bl-sm bg-pink-50 text-blue-950'
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-slate-400">{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_CHAT_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSendChat(q)}
              className="ios-press rounded-full border border-pink-100 bg-pink-50/70 px-2.5 py-1 text-[11px] font-semibold text-blue-900"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendChat();
            }}
            placeholder="Nhắn meme cho bé sticker..."
            className="flex-1 rounded-2xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-medium text-blue-950 outline-hidden focus:border-pink-300"
          />
          <button
            type="button"
            onClick={() => handleSendChat()}
            className="ios-press rounded-2xl bg-blue-900 px-4 text-xs font-bold text-white"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
