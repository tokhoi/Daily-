import React from 'react';
import type { AppLang, ThemeMode, Translations } from '../i18n/translations';
import type { SyncState, Task, TaskLog } from '../types/habit';
import { GIcon } from './GIcon';

interface SettingsViewProps {
  t: Translations;
  lang: AppLang;
  themeMode: ThemeMode;
  isDark: boolean;
  sheetUrl: string;
  syncState: SyncState;
  lastSyncError: string | null;
  tasks: Task[];
  logs: TaskLog[];
  onChangeLang: (lang: AppLang) => void;
  onChangeTheme: (mode: ThemeMode) => void;
  onPullFromSheets: () => void;
  onPushAllToSheets: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  t,
  lang,
  themeMode,
  isDark,
  sheetUrl,
  syncState,
  lastSyncError,
  tasks,
  logs,
  onChangeLang,
  onChangeTheme,
  onPullFromSheets,
  onPushAllToSheets,
}) => {

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

  return (
    <div className="animate-ios-page space-y-4 pb-8">
      {/* Language & Theme Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-[0_6px_24px_-8px_rgba(236,72,153,0.12)] space-y-4">
        {/* Language Selector */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
            {t.langTitle}
          </h3>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-pink-50/80 p-1">
            {(
              [
                { id: 'vi', label: 'Tiếng Việt' },
                { id: 'en', label: 'English' },
                { id: 'zh', label: '中文' },
              ] as { id: AppLang; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeLang(opt.id)}
                className={`ios-press rounded-xl py-2 text-xs font-bold transition ${
                  lang === opt.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-blue-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode Selector */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
              {t.themeTitle}
            </h3>
            <span className="text-[11px] font-semibold text-pink-500">
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-pink-50/80 p-1">
            {(
              [
                { id: 'auto', label: t.themeAuto },
                { id: 'light', label: t.themeLight },
                { id: 'dark', label: t.themeDark },
              ] as { id: ThemeMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeTheme(opt.id)}
                className={`ios-press rounded-xl px-1 py-2 text-[11px] font-bold transition ${
                  themeMode === opt.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-blue-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Google Sheets Sync Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-[0_6px_24px_-8px_rgba(236,72,153,0.12)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
            <GIcon name="cloud_sync" size={24} filled />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#231926]">{t.syncTitle}</h2>
            <p className="text-xs text-slate-500">
              {t.statusLabel}{' '}
              <span className="font-bold text-blue-900">
                {syncState === 'local' && t.statusLocal}
                {syncState === 'syncing' && t.statusSyncing}
                {syncState === 'synced' && t.statusSynced}
                {syncState === 'error' && t.statusError}
              </span>
            </p>
          </div>
        </div>

        {lastSyncError && (
          <div className="mt-3 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
            {lastSyncError}
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Dữ liệu được đồng bộ tự động. Bạn có thể tải lại hoặc lưu bản sao bên dưới.
        </p>

        {sheetUrl && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onPullFromSheets}
              disabled={syncState === 'syncing'}
              className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-pink-100 bg-pink-50/50 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-100/70 disabled:opacity-50"
            >
              <GIcon name="sync" size={16} />
              {t.pullBtn}
            </button>
            <button
              type="button"
              onClick={onPushAllToSheets}
              disabled={syncState === 'syncing'}
              className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
            >
              <GIcon name="cloud_upload" size={16} />
              {t.pushBtn}
            </button>
          </div>
        )}
      </div>

      {/* Local backup */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {t.localDataTitle(tasks.length, logs.length)}
        </h3>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-pink-100 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-pink-50/40"
          >
            <GIcon name="download" size={16} />
            {t.exportJson}
          </button>
        </div>
      </div>
    </div>
  );
};
