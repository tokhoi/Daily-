import React, { useState } from 'react';
import type { SyncState, Task, TaskLog } from '../types/habit';
import { GIcon } from './GIcon';

interface SettingsViewProps {
  sheetUrl: string;
  syncState: SyncState;
  lastSyncError: string | null;
  tasks: Task[];
  logs: TaskLog[];
  onSaveSheetUrl: (url: string) => void;
  onPullFromSheets: () => void;
  onPushAllToSheets: () => void;
  onResetDemoData: () => void;
}

const APPS_SCRIPT_SNIPPET = `// Dán code trong file google-apps-script/Code.gs vào Google Apps Script
// Sau đó Deploy -> Web App -> Anyone can access`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  sheetUrl,
  syncState,
  lastSyncError,
  tasks,
  logs,
  onSaveSheetUrl,
  onPullFromSheets,
  onPushAllToSheets,
  onResetDemoData,
}) => {
  const [urlInput, setUrlInput] = useState(sheetUrl);
  const [copied, setCopied] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetUrl(urlInput);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify({ tasks, logs }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dailylog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyGuide = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="animate-ios-page space-y-4 pb-8">
      {/* Google Sheets Sync Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-[0_6px_24px_-8px_rgba(236,72,153,0.12)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
            <GIcon name="cloud_sync" size={24} filled />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#231926]">
              Đồng bộ Google Sheets
            </h2>
            <p className="text-xs text-slate-500">
              Trạng thái:{' '}
              <span className="font-bold text-blue-900">
                {syncState === 'local' && 'Đang lưu cục bộ (Local)'}
                {syncState === 'syncing' && 'Đang đồng bộ...'}
                {syncState === 'synced' && 'Đã kết nối Google Sheets'}
                {syncState === 'error' && 'Lỗi kết nối'}
              </span>
            </p>
          </div>
        </div>

        {lastSyncError && (
          <div className="mt-3 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            Lỗi: {lastSyncError}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-2.5">
          <label className="block text-xs font-bold text-slate-600">
            Google Apps Script Web App URL
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white"
          />
          <button
            type="submit"
            className="ios-press w-full rounded-2xl bg-blue-900 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-900/20"
          >
            Lưu cấu hình URL
          </button>
        </form>

        {sheetUrl && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPullFromSheets}
              disabled={syncState === 'syncing'}
              className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-pink-100 bg-pink-50/50 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-100/70 disabled:opacity-50"
            >
              <GIcon name="sync" size={16} />
              Tải từ Sheet
            </button>
            <button
              type="button"
              onClick={onPushAllToSheets}
              disabled={syncState === 'syncing'}
              className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-purple-200 bg-purple-50 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
            >
              <GIcon name="cloud_upload" size={16} />
              Đẩy lên Sheet
            </button>
          </div>
        )}
      </div>

      {/* Setup Guide Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-pink-500">
            Cách kết nối Google Sheets
          </h3>
          <button
            type="button"
            onClick={copyGuide}
            className="ios-press flex items-center gap-1 rounded-xl bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-600 hover:bg-pink-100"
          >
            <GIcon name={copied ? 'check' : 'content_copy'} size={14} />
            {copied ? 'Đã copy' : 'Ghi chú'}
          </button>
        </div>
        <ol className="mt-2.5 list-inside list-decimal space-y-1.5 text-xs leading-relaxed text-slate-600">
          <li>
            Tạo Google Sheet mới tại <code className="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700">sheets.new</code>.
          </li>
          <li>
            Chọn <strong>Tiện ích mở rộng → Apps Script</strong>.
          </li>
          <li>
            Dán toàn bộ code trong file{' '}
            <code className="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700">google-apps-script/Code.gs</code> vào.
          </li>
          <li>
            Bấm <strong>Triển khai → Triển khai mới → Ứng dụng web</strong>, chọn quyền truy cập{' '}
            <strong>Bất kỳ ai (Anyone)</strong>.
          </li>
          <li>
            Copy URL nhận được dán vào ô phía trên và bấm <strong>Đẩy lên Sheet</strong>.
          </li>
        </ol>
      </div>

      {/* Backup & Demo Controls */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Dữ liệu cục bộ ({tasks.length} việc • {logs.length} bản ghi)
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-pink-100 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-pink-50/40"
          >
            <GIcon name="download" size={16} />
            Xuất JSON
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
          >
            <GIcon name="restart_alt" size={16} />
            Khôi phục mẫu
          </button>
        </div>
      </div>
    </div>
  );
};
