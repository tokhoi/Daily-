import { useEffect, useState } from 'react';
import { AddTaskModal } from './components/AddTaskModal';
import { GIcon } from './components/GIcon';
import { SettingsView } from './components/SettingsView';
import { SummaryView } from './components/SummaryView';
import { TodayView } from './components/TodayView';
import { WeatherOverlay, type WeatherMode } from './components/WeatherOverlay';
import {
  CelebrationMascotModal,
  SetupSheetOverlayModal,
  WelcomeOverlayModal,
} from './components/JellycatMascot';
import { PhotoCheckModal } from './components/PhotoCheckModal';
import { createSeedData } from './data/seedData';
import {
  bulkSyncToSheets,
  fetchFromSheets,
  getSavedSheetUrl,
  loadDailyNotes,
  loadLocalData,
  saveDailyNotes,
  saveLocalData,
  saveSheetUrl,
  syncLogToSheets,
  syncTaskToSheets,
} from './services/sheetsSync';
import type { AppTab, DailyNote, SyncState, Task, TaskLog } from './types/habit';
import { getLogCompletionRatio, isTaskScheduledForDate, toDateKey } from './utils/dateUtils';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('sakura');
  const [celebrationCount, setCelebrationCount] = useState<number | null>(null);
  const [pendingPhotoCheck, setPendingPhotoCheck] = useState<{
    task: Task;
    dateKey: string;
    nextValue: number;
  } | null>(null);
  const [showSetupOverlay, setShowSetupOverlay] = useState<boolean>(
    () => !getSavedSheetUrl()
  );
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState<boolean>(
    () => Boolean(getSavedSheetUrl())
  );
  const [scrollToTasksTrigger, setScrollToTasksTrigger] = useState(0);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = loadLocalData();
    return cached ? cached.tasks : createSeedData().tasks;
  });

  const [logs, setLogs] = useState<TaskLog[]>(() => {
    const cached = loadLocalData();
    return cached ? cached.logs : createSeedData().logs;
  });

  const [dailyNotes, setDailyNotes] = useState<Record<string, DailyNote>>(() =>
    loadDailyNotes()
  );

  const [sheetUrl, setSheetUrl] = useState<string>(() => getSavedSheetUrl());
  const [syncState, setSyncState] = useState<SyncState>(() =>
    getSavedSheetUrl() ? 'synced' : 'local'
  );
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  useEffect(() => {
    saveLocalData(tasks, logs);
  }, [tasks, logs]);

  useEffect(() => {
    saveDailyNotes(dailyNotes);
  }, [dailyNotes]);

  useEffect(() => {
    if (!sheetUrl) return;
    handlePullFromSheets(sheetUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real-time local weather (defaults to Ho Chi Minh City, no API key needed)
  useEffect(() => {
    const detectWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`
        );
        if (!res.ok) return;
        const json = await res.json();
        const code = Number(json?.current?.weather_code);
        if (
          (code >= 51 && code <= 67) ||
          (code >= 80 && code <= 82) ||
          (code >= 95 && code <= 99)
        ) {
          setWeatherMode('rain');
        } else if (code >= 45 && code <= 48) {
          setWeatherMode('sparkle');
        } else {
          setWeatherMode('sakura');
        }
      } catch {
        // Keep default sakura on network failure
      }
    };

    detectWeather(10.8231, 106.6297);
  }, []);

  const cycleWeatherMode = () => {
    const order: WeatherMode[] = ['sakura', 'rain', 'sparkle', 'off'];
    setWeatherMode((curr) => order[(order.indexOf(curr) + 1) % order.length]);
  };

  const handlePullFromSheets = async (url = sheetUrl, allowEmpty = false) => {
    if (!url) return;
    setSyncState('syncing');
    setLastSyncError(null);
    try {
      const remote = await fetchFromSheets(url);
      if (allowEmpty || remote.tasks.length > 0 || remote.logs.length > 0) {
        setTasks(remote.tasks);
        setLogs(remote.logs);
      }
      setSyncState('synced');
    } catch (err) {
      setSyncState('error');
      setLastSyncError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    }
  };

  const handlePushAllToSheets = async () => {
    if (!sheetUrl) return;
    setSyncState('syncing');
    setLastSyncError(null);
    try {
      await bulkSyncToSheets(sheetUrl, tasks, logs);
      setSyncState('synced');
    } catch (err) {
      setSyncState('error');
      setLastSyncError(err instanceof Error ? err.message : 'Không thể đẩy dữ liệu');
    }
  };

  const handleSaveSheetUrl = (url: string) => {
    const trimmed = url.trim();
    saveSheetUrl(trimmed);
    setSheetUrl(trimmed);
    if (!trimmed) {
      setSyncState('local');
      setLastSyncError(null);
    } else {
      handlePullFromSheets(trimmed);
    }
  };

  const upsertLog = (nextLog: TaskLog) => {
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === nextLog.id);
      const nextLogs = idx >= 0 ? prev.map((l, i) => (i === idx ? nextLog : l)) : [...prev, nextLog];

      // Check if user just reached 100% completion for selectedDate
      const scheduled = tasks.filter((t) => isTaskScheduledForDate(t, nextLog.log_date));
      if (scheduled.length > 0 && nextLog.status === 'completed') {
        const allDoneNow = scheduled.every((t) => {
          const l = nextLogs.find((x) => x.task_id === t.id && x.log_date === nextLog.log_date);
          return getLogCompletionRatio(t, l) >= 1;
        });
        const wasAllDoneBefore = scheduled.every((t) => {
          const l = prev.find((x) => x.task_id === t.id && x.log_date === nextLog.log_date);
          return getLogCompletionRatio(t, l) >= 1;
        });
        if (allDoneNow && !wasAllDoneBefore) {
          setCelebrationCount(scheduled.length);
        }
      }

      return nextLogs;
    });

    if (sheetUrl) {
      setSyncState('syncing');
      syncLogToSheets(sheetUrl, nextLog)
        .then(() => setSyncState('synced'))
        .catch((err) => {
          setSyncState('error');
          setLastSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ log');
        });
    }
  };

  const handleToggleBoolean = (task: Task, dateKey: string) => {
    const logId = `${task.id}_${dateKey}`;
    const existing = logs.find((l) => l.id === logId);
    const currentlyDone = existing && existing.status !== 'skipped' && existing.value >= 1;

    if (!currentlyDone) {
      setPendingPhotoCheck({ task, dateKey, nextValue: 1 });
      return;
    }

    upsertLog({
      id: logId,
      task_id: task.id,
      log_date: dateKey,
      value: 0,
      target_snapshot: task.target_value || 1,
      status: 'pending',
      note: existing?.note || '',
      photo: '',
      updated_at: new Date().toISOString(),
    });
  };

  const handleIncrementCount = (task: Task, dateKey: string, delta: number) => {
    const logId = `${task.id}_${dateKey}`;
    const existing = logs.find((l) => l.id === logId);
    const target = existing?.target_snapshot || task.target_value || 1;
    const prevValue = existing?.value ?? 0;
    const nextValue = Math.max(0, prevValue + delta);

    if (delta > 0 && prevValue < target && nextValue >= target) {
      setPendingPhotoCheck({ task, dateKey, nextValue });
      return;
    }

    upsertLog({
      id: logId,
      task_id: task.id,
      log_date: dateKey,
      value: nextValue,
      target_snapshot: target,
      status: nextValue >= target ? 'completed' : nextValue > 0 ? 'partial' : 'pending',
      note: existing?.note || '',
      photo: existing?.photo || '',
      updated_at: new Date().toISOString(),
    });
  };

  const handleConfirmPhotoCheck = (photoDataUrl: string) => {
    if (!pendingPhotoCheck) return;
    const { task, dateKey, nextValue } = pendingPhotoCheck;
    const logId = `${task.id}_${dateKey}`;
    const existing = logs.find((l) => l.id === logId);
    const target = existing?.target_snapshot || task.target_value || 1;

    upsertLog({
      id: logId,
      task_id: task.id,
      log_date: dateKey,
      value: nextValue,
      target_snapshot: target,
      status: 'completed',
      note: existing?.note || '',
      photo: photoDataUrl,
      updated_at: new Date().toISOString(),
    });
    setPendingPhotoCheck(null);
  };

  const handleToggleSkip = (task: Task, dateKey: string) => {
    const logId = `${task.id}_${dateKey}`;
    const existing = logs.find((l) => l.id === logId);
    const isSkipped = existing?.status === 'skipped';

    upsertLog({
      id: logId,
      task_id: task.id,
      log_date: dateKey,
      value: 0,
      target_snapshot: existing?.target_snapshot || task.target_value || 1,
      status: isSkipped ? 'pending' : 'skipped',
      note: existing?.note || '',
      updated_at: new Date().toISOString(),
    });
  };

  const handleUpdateNote = (task: Task, dateKey: string, note: string) => {
    const logId = `${task.id}_${dateKey}`;
    const existing = logs.find((l) => l.id === logId);

    upsertLog({
      id: logId,
      task_id: task.id,
      log_date: dateKey,
      value: existing?.value ?? 0,
      target_snapshot: existing?.target_snapshot || task.target_value || 1,
      status: existing?.status || 'pending',
      note,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSaveTask = (task: Task, isEdit: boolean) => {
    setTasks((prev) =>
      isEdit ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task]
    );
    if (sheetUrl) {
      setSyncState('syncing');
      syncTaskToSheets(sheetUrl, task)
        .then(() => setSyncState('synced'))
        .catch((err) => {
          setSyncState('error');
          setLastSyncError(err instanceof Error ? err.message : 'Lỗi lưu task');
        });
    }
  };

  const handleToggleTaskDefaultNote = (task: Task) => {
    const updated: Task = {
      ...task,
      default_note_done: !task.default_note_done,
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (sheetUrl) {
      syncTaskToSheets(sheetUrl, updated).catch(console.error);
    }
  };

  const handleSaveDailyNote = (dateKey: string, next: DailyNote) => {
    setDailyNotes((prev) => ({
      ...prev,
      [dateKey]: next,
    }));
  };

  const handleArchiveTask = (task: Task) => {
    const archivedTask: Task = {
      ...task,
      archived_at: `${selectedDate}T00:00:00.000Z`,
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? archivedTask : t)));
    if (sheetUrl) {
      syncTaskToSheets(sheetUrl, archivedTask).catch(console.error);
    }
  };

  const handleResetDemoData = () => {
    const seed = createSeedData();
    setTasks(seed.tasks);
    setLogs(seed.logs);
  };

  const todayKey = toDateKey(new Date());
  const pendingTodayTasks = tasks.filter((t) => {
    if (!isTaskScheduledForDate(t, todayKey)) return false;
    const log = logs.find((l) => l.task_id === t.id && l.log_date === todayKey);
    if (log?.status === 'skipped') return false;
    return getLogCompletionRatio(t, log) < 1;
  });

  const activeTabIndex = activeTab === 'today' ? 0 : activeTab === 'summary' ? 1 : 2;

  return (
    <div className="flex min-h-screen justify-center bg-[#FFF5F8]">
      {/* Mobile Miniapp Frame */}
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#FFFBFD] shadow-[0_0_50px_-12px_rgba(30,58,138,0.14)]">
        {/* Weather-synced Falling Animation Overlay */}
        <WeatherOverlay mode={weatherMode} />

        {/* Frosted Glass iOS Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-pink-100/80 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <div>
            <h1 className="bg-gradient-to-r from-pink-400 to-blue-900 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              DailyLog
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              {activeTab === 'today' && 'Ghi nhận việc hằng ngày'}
              {activeTab === 'summary' && 'Tổng kết tuần • tháng • năm'}
              {activeTab === 'settings' && 'Kết nối Google Sheets'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Weather Mode Toggle Pill */}
            <button
              type="button"
              onClick={cycleWeatherMode}
              className="ios-press flex items-center gap-1 rounded-full border border-pink-100 bg-pink-50/70 px-2.5 py-1 text-[11px] font-bold text-blue-900 transition hover:bg-pink-100/70"
              title="Đổi hiệu ứng thời tiết"
            >
              <GIcon
                name={
                  weatherMode === 'rain'
                    ? 'rainy'
                    : weatherMode === 'sparkle'
                      ? 'auto_awesome'
                      : 'local_florist'
                }
                size={14}
                className={weatherMode === 'off' ? 'opacity-40' : 'text-pink-400'}
              />
              <span>
                {weatherMode === 'sakura' && 'Hoa rơi'}
                {weatherMode === 'rain' && 'Mưa rơi'}
                {weatherMode === 'sparkle' && 'Lấp lánh'}
                {weatherMode === 'off' && 'Tắt'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`ios-press flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                syncState === 'synced'
                  ? 'bg-emerald-50 text-emerald-700'
                  : syncState === 'syncing'
                    ? 'bg-blue-50 text-blue-900'
                    : syncState === 'error'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-pink-50 text-pink-500'
              }`}
              title="Trạng thái đồng bộ"
            >
              <GIcon
                name={
                  syncState === 'local'
                    ? 'cloud_off'
                    : syncState === 'error'
                      ? 'cloud_alert'
                      : 'cloud_done'
                }
                size={14}
              />
              <span>
                {syncState === 'local' && 'Local'}
                {syncState === 'syncing' && 'Sync'}
                {syncState === 'synced' && 'Sheets'}
                {syncState === 'error' && 'Lỗi'}
              </span>
            </button>

            {activeTab === 'today' && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsAddModalOpen(true);
                }}
                className="ios-press flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-900 text-white shadow-md shadow-blue-900/20"
                aria-label="Thêm việc"
              >
                <GIcon name="add" size={20} weight={600} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
          {activeTab === 'today' && (
            <TodayView
              key="today-tab"
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              tasks={tasks}
              logs={logs}
              dailyNote={dailyNotes[selectedDate]}
              scrollToTasksTrigger={scrollToTasksTrigger}
              onToggleBoolean={handleToggleBoolean}
              onIncrementCount={handleIncrementCount}
              onToggleSkip={handleToggleSkip}
              onUpdateNote={handleUpdateNote}
              onToggleTaskDefaultNote={handleToggleTaskDefaultNote}
              onSaveDailyNote={handleSaveDailyNote}
              onArchiveTask={handleArchiveTask}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsAddModalOpen(true);
              }}
              onOpenAddModal={() => {
                setEditingTask(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryView key="summary-tab" tasks={tasks} logs={logs} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              key="settings-tab"
              sheetUrl={sheetUrl}
              syncState={syncState}
              lastSyncError={lastSyncError}
              tasks={tasks}
              logs={logs}
              onSaveSheetUrl={handleSaveSheetUrl}
              onPullFromSheets={() => handlePullFromSheets(sheetUrl, true)}
              onPushAllToSheets={handlePushAllToSheets}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>

        {/* Floating iOS Glassmorphic Bottom Navigation */}
        <div className="pointer-events-none fixed bottom-3 z-30 flex w-full max-w-[430px] justify-center px-4">
          <nav className="pointer-events-auto relative grid w-full grid-cols-3 rounded-[26px] border border-pink-100/90 bg-white/85 p-1.5 shadow-[0_10px_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-xl">
            {/* Sliding active background pill */}
            <div
              className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/3)] rounded-[20px] bg-pink-100/80 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
            />

            {(
              [
                { id: 'today', label: 'Hôm nay', icon: 'check_circle' },
                { id: 'summary', label: 'Tổng kết', icon: 'bar_chart' },
                { id: 'settings', label: 'Cài đặt', icon: 'settings' },
              ] as { id: AppTab; label: string; icon: string }[]
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`ios-press relative z-10 flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[11px] font-bold transition-colors duration-300 ${
                    active ? 'text-blue-900' : 'text-slate-400 hover:text-pink-400'
                  }`}
                >
                  <GIcon name={tab.icon} size={22} filled={active} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Add / Edit Task Modal */}
        {isAddModalOpen && (
          <AddTaskModal
            selectedDate={selectedDate}
            editingTask={editingTask}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
          />
        )}

        {/* Photo Confirmation Modal on Task Completion */}
        {pendingPhotoCheck && (
          <PhotoCheckModal
            task={pendingPhotoCheck.task}
            onConfirm={handleConfirmPhotoCheck}
            onCancel={() => setPendingPhotoCheck(null)}
          />
        )}

        {/* Step 1: Setup Google Sheet URL Overlay if not configured */}
        {showSetupOverlay && (
          <SetupSheetOverlayModal
            onSaveUrl={(url) => {
              handleSaveSheetUrl(url);
              setShowSetupOverlay(false);
              setShowWelcomeOverlay(true);
            }}
            onSkip={() => {
              setShowSetupOverlay(false);
              setShowWelcomeOverlay(true);
            }}
          />
        )}

        {/* Step 2: Welcome Task Reminder + Daily Note Overlay */}
        {!showSetupOverlay && showWelcomeOverlay && (
          <WelcomeOverlayModal
            pendingTasks={pendingTodayTasks}
            initialDailyNote={dailyNotes[todayKey]?.text || ''}
            onGoToTasks={(noteText) => {
              if (noteText.trim()) {
                handleSaveDailyNote(todayKey, {
                  text: noteText.trim(),
                  done: dailyNotes[todayKey]?.done ?? false,
                });
              }
              setShowWelcomeOverlay(false);
              setActiveTab('today');
              setSelectedDate(todayKey);
              setScrollToTasksTrigger((n) => n + 1);
            }}
            onDismiss={(noteText) => {
              if (noteText.trim()) {
                handleSaveDailyNote(todayKey, {
                  text: noteText.trim(),
                  done: dailyNotes[todayKey]?.done ?? false,
                });
              }
              setShowWelcomeOverlay(false);
            }}
          />
        )}

        {/* Jellycat Clapping Celebration Modal when 100% completed */}
        {celebrationCount !== null && (
          <CelebrationMascotModal
            completedCount={celebrationCount}
            onClose={() => setCelebrationCount(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
