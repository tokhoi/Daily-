import stickerWave from '../assets/stickers/sticker_wave.jpg';
import stickerClap from '../assets/stickers/sticker_clap.jpg';
import stickerLove from '../assets/stickers/sticker_love.jpg';
import stickerChill from '../assets/stickers/sticker_chill.jpg';
import stickerSleep from '../assets/stickers/sticker_sleep.jpg';
import stickerCry from '../assets/stickers/sticker_cry.jpg';

export type StickerId = 'wave' | 'clap' | 'love' | 'chill' | 'sleep' | 'cry';

export interface StickerItem {
  id: StickerId;
  label: string;
  src: string;
  token: string;
}

export const STICKER_PACK: StickerItem[] = [
  { id: 'wave', label: 'Vẫy chào', src: stickerWave, token: '[sticker:wave]' },
  { id: 'clap', label: 'Đỉnh nóc', src: stickerClap, token: '[sticker:clap]' },
  { id: 'love', label: 'Bắn tim', src: stickerLove, token: '[sticker:love]' },
  { id: 'chill', label: 'Trà sữa chill', src: stickerChill, token: '[sticker:chill]' },
  { id: 'sleep', label: 'Ngủ ngon', src: stickerSleep, token: '[sticker:sleep]' },
  { id: 'cry', label: 'Cứu deadline', src: stickerCry, token: '[sticker:cry]' },
];

export const STICKER_BY_ID: Record<StickerId, StickerItem> = {
  wave: STICKER_PACK[0],
  clap: STICKER_PACK[1],
  love: STICKER_PACK[2],
  chill: STICKER_PACK[3],
  sleep: STICKER_PACK[4],
  cry: STICKER_PACK[5],
};

export function parseStickerToken(text: string): StickerItem | null {
  const match = text.trim().match(/^\[sticker:([a-z_]+)\]$/);
  if (!match) return null;
  const id = match[1] as StickerId;
  return STICKER_BY_ID[id] ?? null;
}
