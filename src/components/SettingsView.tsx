import React, { useState } from 'react';
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
  onSaveSheetUrl: (url: string) => void;
  onPullFromSheets: () => void;
  onPushAllToSheets: () => void;
  onResetDemoData: () => void;
}

const APPS_SCRIPT_SNIPPET = `// Paste code from google-apps-script/Code.gs into Google Apps Script
// Deploy -> Web App -> Anyone can access`;

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
            {t.saveUrlBtn}
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

      {/* Setup Guide Card */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-pink-500">
            Google Sheets Guide
          </h3>
          <button
            type="button"
            onClick={copyGuide}
            className="ios-press flex items-center gap-1 rounded-xl bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-600 hover:bg-pink-100"
          >
            <GIcon name={copied ? 'check' : 'content_copy'} size={14} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <ol className="mt-2.5 list-inside list-decimal space-y-1.5 text-xs leading-relaxed text-slate-600">
          <li>
            <code className="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700">sheets.new</code> → Extensions → Apps Script
          </li>
          <li>
            Paste <code className="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700">google-apps-script/Code.gs</code>
          </li>
          <li>Deploy → Web App → Who has access: <strong>Anyone</strong></li>
          <li>Paste URL above & sync.</li>
        </ol>
      </div>

      {/* Backup & Demo Controls */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {t.localDataTitle(tasks.length, logs.length)}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-pink-100 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-pink-50/40"
          >
            <GIcon name="download" size={16} />
            {t.exportJson}
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            className="ios-press flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
          >
            <GIcon name="restart_alt" size={16} />
            {t.resetDemo}
          </button>
        </div>
      </div>
    </div>
  );
};
