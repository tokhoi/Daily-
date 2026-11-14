import React, { useEffect, useState } from 'react';
import { loginAccount, registerAccount } from '../services/sheetsSync';
import type { AppUser, CoupleProfile } from '../types/habit';
import { GIcon } from './GIcon';

interface UserLoginModalProps {
  sheetUrl: string;
  currentUser: AppUser | null;
  coupleProfile?: CoupleProfile;
  onAuthSuccess: (user: AppUser) => void;
  onLogout: () => void;
  onClose?: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  sheetUrl,
  currentUser,
  coupleProfile,
  onAuthSuccess,
  onLogout,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (!lockUntil) return;
    const timer = setInterval(() => {
      const remain = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setLockSeconds(remain);
      if (remain === 0) {
        setLockUntil(null);
        setFailCount(0);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [lockUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockUntil && Date.now() < lockUntil) {
      setError(`Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau ${lockSeconds}s.`);
      return;
    }

    const cleanId = userId.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(cleanId)) {
      setError('Tên đăng nhập dài 3–24 ký tự, chỉ gồm chữ thường, số hoặc "_".');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Vui lòng nhập tên hiển thị.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const authedUser =
        mode === 'register'
          ? await registerAccount(sheetUrl, {
              user_id: cleanId,
              display_name: displayName.trim(),
              password,
            })
          : await loginAccount(sheetUrl, {
              user_id: cleanId,
              password,
            });
      setFailCount(0);
      onAuthSuccess(authedUser);
    } catch (err) {
      const nextFails = failCount + 1;
      setFailCount(nextFails);
      if (mode === 'login' && nextFails >= 5) {
        const until = Date.now() + 30_000;
        setLockUntil(until);
        setLockSeconds(30);
        setError('Nhập sai 5 lần. Tài khoản tạm khóa 30 giây.');
      } else {
        setError(err instanceof Error ? err.message : 'Xác thực thất bại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
      <div className="animate-ios-sheet w-full max-w-[395px] rounded-[28px] border border-pink-200 bg-white p-5 shadow-[0_24px_60px_-15px_rgba(30,58,138,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-blue-900">
              <GIcon name="person" size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-blue-950">
                Tài khoản DailyLog
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Lưu tiến độ &amp; kết nối không gian cặp đôi
              </p>
            </div>
          </div>
          {onClose && currentUser && (
            <button
              type="button"
              onClick={onClose}
              className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-slate-500"
              aria-label="Đóng"
            >
              <GIcon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Signed-in Personal Profile View */}
        {currentUser ? (
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/60 p-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-blue-900 text-base font-extrabold text-white shadow-sm">
                {currentUser.display_name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-blue-950">
                  {currentUser.display_name}
                </p>
                <p className="text-xs font-semibold text-pink-500">
                  @{currentUser.user_id}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                Đang hoạt động
              </span>
            </div>

            <div className="space-y-2 rounded-2xl border border-pink-100 bg-pink-50/30 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-400">Mã cá nhân</span>
                <span className="font-extrabold tracking-wider text-blue-950">
                  {coupleProfile?.myCode || currentUser.user_id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-400">Không gian Couple</span>
                <span className="font-bold text-blue-950">
                  {coupleProfile?.isPaired
                    ? `Đã kết nối • ${coupleProfile.partnerName}`
                    : 'Chưa liên kết'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ios-press flex-1 rounded-2xl border border-pink-100 bg-pink-50/70 py-3 text-xs font-bold text-blue-950"
                >
                  Đóng
                </button>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="ios-press flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-rose-500 py-3 text-xs font-extrabold text-white shadow-md shadow-rose-500/20"
              >
                <GIcon name="logout" size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Login / Register Tabs */}
            <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-pink-50/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`ios-press rounded-xl py-2 text-xs font-extrabold transition ${
                  mode === 'login'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`ios-press rounded-xl py-2 text-xs font-extrabold transition ${
                  mode === 'register'
                    ? 'bg-pink-400 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Đăng ký mới
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="auth-user-id" className="mb-1 block text-[11px] font-bold text-slate-500">
                  Tên đăng nhập
                </label>
                <input
                  id="auth-user-id"
                  name="user_id"
                  type="text"
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="vd: khoi hoặc giahan"
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-display-name" className="mb-1 block text-[11px] font-bold text-slate-500">
                    Tên hiển thị
                  </label>
                  <input
                    id="auth-display-name"
                    name="display_name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="vd: Gia Hân"
                    className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-password" className="mb-1 block text-[11px] font-bold text-slate-500">
                  Mật khẩu (tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-pink-100 bg-pink-50/40 py-2.5 pr-10 pl-3.5 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-blue-900"
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    <GIcon name={showPassword ? 'visibility_off' : 'wb_sunny'} size={16} />
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-confirm-password" className="mb-1 block text-[11px] font-bold text-slate-500">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="auth-confirm-password"
                    name="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full rounded-xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-semibold text-blue-950 outline-hidden focus:border-pink-300"
                  />
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (lockUntil !== null && lockSeconds > 0)}
                className="ios-press w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Đang xác thực...'
                  : mode === 'login'
                    ? 'Đăng nhập'
                    : 'Tạo tài khoản & Đăng nhập'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
