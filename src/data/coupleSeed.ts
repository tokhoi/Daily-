import type {
  CoupleChatMessage,
  CoupleNudge,
  CoupleProfile,
  PartnerCheckin,
} from '../types/habit';

/**
 * Generates clean SVG data-URI photo cards so Tinder-swipe & Locket feed
 * look rich immediately without external broken image URLs.
 */
function makeMockCheckinPhoto(
  bg1: string,
  bg2: string,
  label: string,
  sub: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="480" fill="url(#g)"/>
    <circle cx="320" cy="90" r="70" fill="white" opacity="0.18"/>
    <circle cx="80" cy="390" r="95" fill="white" opacity="0.14"/>
    <text x="200" y="220" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="800" fill="white">${label}</text>
    <text x="200" y="262" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="white" opacity="0.9">${sub}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createDefaultCoupleProfile(): CoupleProfile {
  return {
    myName: 'Tô Khôi',
    myCode: 'DL-4829',
    partnerName: 'Gia Hân',
    partnerCode: '',
    isPaired: false,
    bearStyle: 'pink',
  };
}

export function createMockPartnerCheckins(): PartnerCheckin[] {
  return [
    {
      id: 'pc-1',
      taskTitle: 'Uống đủ 8 ly nước',
      emoji: 'water_drop',
      color: '#F472B6',
      completedAt: '09:20',
      note: 'Đã uống hết bình 1L buổi sáng!',
      photo: makeMockCheckinPhoto('#F9A8D4', '#1E3A8A', '8 / 8 Ly Nước', 'Check-in lúc 09:20'),
      reaction: null,
    },
    {
      id: 'pc-2',
      taskTitle: 'Đọc 20 trang sách',
      emoji: 'menu_book',
      color: '#1E3A8A',
      completedAt: '13:45',
      note: 'Đọc xong chương 4 cuốn Nhà Giả Kim',
      photo: makeMockCheckinPhoto('#1E3A8A', '#F472B6', 'Đọc Sách 20p', 'Check-in lúc 13:45'),
      reaction: null,
    },
    {
      id: 'pc-3',
      taskTitle: 'Đi bộ 30 phút buổi chiều',
      emoji: 'directions_walk',
      color: '#10B981',
      completedAt: '17:30',
      note: 'Trời mát quá nên đi bộ quanh công viên luôn',
      photo: makeMockCheckinPhoto('#34D399', '#1E3A8A', 'Đi Bộ Công Viên', 'Check-in lúc 17:30'),
      reaction: null,
    },
  ];
}

export function createMockNudges(): CoupleNudge[] {
  return [
    {
      id: 'nudge-1',
      from: 'partner',
      message: 'Nhớ uống đủ nước hôm nay nha!',
      createdAt: '10:15',
    },
  ];
}

export function createMockCoupleChat(): CoupleChatMessage[] {
  return [
    {
      id: 'chat-1',
      sender: 'partner',
      text: 'Sáng nay cậu dậy sớm chưa nè? Mình uống hết 1L nước rồi đó 💧',
      createdAt: '09:22',
    },
    {
      id: 'chat-2',
      sender: 'me',
      text: 'Mình đang cố hoàn thành hết task hôm nay để giữ streak với cậu nè!',
      createdAt: '09:25',
    },
    {
      id: 'chat-3',
      sender: 'partner',
      text: 'Cố lên nha, tối nay cùng so % xem ai cao hơn 💖',
      createdAt: '10:16',
    },
  ];
}

export function createMockPartnerWeeklyPercents(): number[] {
  return [78, 92, 65, 88, 100, 82, 86];
}
