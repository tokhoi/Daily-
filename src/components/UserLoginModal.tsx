import React, { useState } from 'react';
import type { AppUser } from '../types/habit';
import { GIcon } from './GIcon';

interface UserLoginModalProps {
  existingUsers: AppUser[];
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onClose?: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  existingUsers,
  currentUser,
  onLogin,
  onClose,
}) => {
  const [userId, setUserId] = useState(currentUser?.user_id || '');
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [pin, setPin] = useState('');
  const [partnerId, setPartnerId] = useState(currentUser?.partner_id || '');
  const [roomCode, setRoomCode] = useState(currentUser?.room_code || '');
  const [error, setError] = useState('');

  const handleSelectExisting = (u: AppUser) => {
    setUserId(u.user_id);
    setDisplayName(u.display_name);
    setPartnerId(u.partner_id || '');
    setRoomCode(u.room_code || '');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userId.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanName = displayName.trim();
    if (!cleanId || !cleanName) {
      setError('Vui lòng nhập mã user và tên hiển thị.');
      return;
    }

    const found = existingUsers.find((u) => u.user_id.toLowerCase() === cleanId);
    if (found && found.pin && found.pin !== pin.trim()) {
      setError('Mã PIN chưa đúng cho tài khoản này.');
      return;
    }

    const nextUser: AppUser = {
      user_id: cleanId,
      display_name: cleanName,
      pin: pin.trim() || found?.pin || '0000',
      partner_id: partnerId.trim().toLowerCase().replace(/\s+/g, '_') || undefined,
      room_code: roomCode.trim().toUpperCase() || undefined,
      created_at: found?.created_at || new Date().toISOString(),
    };

    onLogin(nextUser);
  };

  return (
    <div className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
      <div className="animate-ios-sheet w-full max-w-[390px] rounded-[28px] border border-pink-200 bg-white p-5 shadow-[0_24px_60px_-15px_rgba(30,58,138,0.35)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-blue-900">
              <GIcon name="person" size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-blue-950">
                Đăng nhập / Chọn User
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Tách riêng task & đồng bộ đúng người trong Couple
              </p>
            </div>
          </div>
          {onClose && currentUser && (
            <button
              type="button"
              onClick={onClose}
              className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-slate-500"
            >
              <GIcon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Existing users from Google Sheets */}
        {existingUsers.length > 0 && (
          <div className="mt-3.5">
            <p className="mb-1.5 text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">
              Tài khoản có sẵn trên Sheet
            </p>
            <div className="flex flex-wrap gap-1.5">
              {existingUsers.map((u) => (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => handleSelectExisting(u)}
                  className={`ios-press rounded-full border px-3 py-1 text-[11px] font-bold transition ${
                    userId === u.user_id
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-pink-100 bg-pink-50/70 text-blue-950'
                  }`}
                >
                  {u.display_name} (@{u.user_id})
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                Mã User (ID)
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="vd: khoi"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="vd: Khôi"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                Mã PIN (4 số)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="vd: 1234"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-500">
                ID Người ấy (tuỳ chọn)
              </label>
              <input
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder="vd: giahan"
                className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-500">
              Mã phòng Couple (tuỳ chọn — có thể tạo sau)
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Để trống nếu chưa ghép đôi"
              className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs font-semibold text-blue-950 uppercase outline-hidden focus:border-pink-300"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ios-press w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20"
          >
            Vào App với Tài khoản này
          </button>
        </form>
      </div>
    </div>
  );
};
