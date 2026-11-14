import React, { useRef, useState } from 'react';
import type { Task } from '../types/habit';
import { GIcon } from './GIcon';

interface PhotoCheckModalProps {
  task: Task;
  onConfirm: (photoDataUrl: string) => void;
  onCancel: () => void;
}

function compressImage(file: File, maxWidth = 360, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PhotoCheckModal: React.FC<PhotoCheckModalProps> = ({
  task,
  onConfirm,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch {
      // ignore
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="animate-ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-blue-950/30 backdrop-blur-[2px] sm:items-center"
      onClick={onCancel}
    >
      <div
        className="animate-ios-sheet w-full max-w-[430px] rounded-t-[32px] bg-white p-5 shadow-2xl sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-pink-200 sm:hidden" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-blue-950">
              Chụp ảnh xác nhận
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Việc: <strong className="text-blue-900">{task.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100"
          >
            <GIcon name="close" size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-4">
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl border border-pink-100 bg-pink-50/30">
              <img
                src={preview}
                alt="Ảnh xác nhận"
                className="max-h-60 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="ios-press absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-blue-900 shadow-sm backdrop-blur-sm"
              >
                <GIcon name="photo_camera" size={14} />
                Chụp lại
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ios-press flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40 py-9 text-blue-900 transition hover:bg-pink-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-blue-900">
                <GIcon name="photo_camera" size={26} />
              </div>
              <span className="text-xs font-bold">
                {processing ? 'Đang xử lý ảnh...' : 'Mở Camera / Chọn ảnh xác nhận'}
              </span>
              <span className="text-[11px] text-slate-400">
                Ảnh được nén gọn để lưu đồng bộ
              </span>
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={!preview || processing}
            onClick={() => onConfirm(preview)}
            className="ios-press w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-900/20 disabled:opacity-40"
          >
            Xác nhận hoàn thành
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
