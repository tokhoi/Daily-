import { useEffect, useRef, useState } from 'react';
import { AddTaskModal } from './components/AddTaskModal';
import { Bear3DStudio } from './components/Bear3DStudio';
import { CoupleView } from './components/CoupleView';
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
import { UserLoginModal } from './components/UserLoginModal';
import { createDefaultCoupleProfile } from './data/coupleSeed';
import { createSeedData } from './data/seedData';
import {
  TRANSLATIONS,
  type AppLang,
  type ThemeMode,
} from './i18n/translations';
import {
  bulkSyncToSheets,
  clearCurrentUser,
  fetchFromSheets,
  getSavedSheetUrl,
  loadCurrentUser,
  loadDailyNotes,
  loadLocalData,
  pairCoupleOnSheets,
  saveCurrentUser,
  saveDailyNotes,
  saveLocalData,
  saveSheetUrl,
  syncCoupleChatToSheets,
  syncCoupleNudgeToSheets,
  syncCoupleProfileToSheets,
  syncLogToSheets,
  syncPartnerCheckinToSheets,
  syncTaskToSheets,
} from './services/sheetsSync';
import type {
  AppTab,
  AppUser,
  CoupleChatMessage,
  CoupleNudge,
  CoupleProfile,
  DailyNote,
  PartnerCheckin,
  SyncState,
  Task,
  TaskLog,
} from './types/habit';
import { getLogCompletionRatio, isTaskScheduledForDate, toDateKey } from './utils/dateUtils';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('sakura');
  const [weatherKind, setWeatherKind] = useState<'rain' | 'cloudy' | 'sunny'>('sunny');
  const [weatherTemp, setWeatherTemp] = useState<string>('');
  const [isDayRemote, setIsDayRemote] = useState<boolean | null>(null);
  const [lang, setLang] = useState<AppLang>(() => {
    const saved = localStorage.getItem('daily_miniapp_lang_v1');
    return saved === 'en' || saved === 'zh' ? saved : 'vi';
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('daily_miniapp_theme_v1');
    return saved === 'light' || saved === 'dark' ? saved : 'auto';
  });
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
    return cached ? cached.tasks : [];
  });

  const [logs, setLogs] = useState<TaskLog[]>(() => {
    const cached = loadLocalData();
    return cached ? cached.logs : [];
  });

  const [dailyNotes, setDailyNotes] = useState<Record<string, DailyNote>>(() =>
    loadDailyNotes()
  );

  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile>(() => {
    try {
      const raw = localStorage.getItem('daily_miniapp_couple_profile_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as CoupleProfile;
        if (parsed.partnerName === 'Minh Anh') parsed.partnerName = 'Gia Hân';
        if (parsed.myName === 'Bạn') parsed.myName = 'Tô Khôi';
        return parsed;
      }
    } catch {
      // ignore
    }
    return createDefaultCoupleProfile();
  });

  const [partnerCheckins, setPartnerCheckins] = useState<PartnerCheckin[]>(() => {
    try {
      const raw = localStorage.getItem('daily_miniapp_couple_checkins_v1');
      if (raw) return JSON.parse(raw) as PartnerCheckin[];
    } catch {
      // ignore
    }
    return [];
  });

  const [nudges, setNudges] = useState<CoupleNudge[]>(() => {
    try {
      const raw = localStorage.getItem('daily_miniapp_couple_nudges_v1');
      if (raw) return JSON.parse(raw) as CoupleNudge[];
    } catch {
      // ignore
    }
    return [];
  });

  const [coupleChat, setCoupleChat] = useState<CoupleChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('daily_miniapp_couple_chat_v1');
      if (raw) return JSON.parse(raw) as CoupleChatMessage[];
    } catch {
      // ignore
    }
    return [];
  });

  const [showNudgeNotice, setShowNudgeNotice] = useState<boolean>(
    () => coupleProfile.isPaired
  );
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => loadCurrentUser());
  const [remoteUsers, setRemoteUsers] = useState<AppUser[]>([]);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);

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
    localStorage.setItem('daily_miniapp_couple_profile_v1', JSON.stringify(coupleProfile));
  }, [coupleProfile]);

  useEffect(() => {
    localStorage.setItem('daily_miniapp_couple_checkins_v1', JSON.stringify(partnerCheckins));
  }, [partnerCheckins]);

  useEffect(() => {
    localStorage.setItem('daily_miniapp_couple_nudges_v1', JSON.stringify(nudges));
  }, [nudges]);

  useEffect(() => {
    localStorage.setItem('daily_miniapp_couple_chat_v1', JSON.stringify(coupleChat));
  }, [coupleChat]);

  useEffect(() => {
    localStorage.setItem('daily_miniapp_lang_v1', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('daily_miniapp_theme_v1', themeMode);
  }, [themeMode]);

  const hour = new Date().getHours();
  const isNightByClock = hour >= 18 || hour < 6;
  const isDark =
    themeMode === 'dark'
      ? true
      : themeMode === 'light'
        ? false
        : isDayRemote !== null
          ? !isDayRemote || isNightByClock
          : isNightByClock;

  const t = TRANSLATIONS[lang];
  const weatherTip =
    weatherKind === 'rain'
      ? t.tipRain(weatherTemp)
      : weatherKind === 'cloudy'
        ? t.tipCloudy(weatherTemp)
        : t.tipSunny(weatherTemp);

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
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,is_day`
        );
        if (!res.ok) return;
        const json = await res.json();
        const code = Number(json?.current?.weather_code);
        const temp = json?.current?.temperature_2m;
        const tempText = typeof temp === 'number' ? ` (${Math.round(temp)}°C)` : '';
        setWeatherTemp(tempText);
        if (typeof json?.current?.is_day === 'number') {
          setIsDayRemote(json.current.is_day === 1);
        }

        if (
          (code >= 51 && code <= 67) ||
          (code >= 80 && code <= 82) ||
          (code >= 95 && code <= 99)
        ) {
          setWeatherMode('rain');
          setWeatherKind('rain');
        } else if (code >= 45 && code <= 48) {
          setWeatherMode('sparkle');
          setWeatherKind('cloudy');
        } else {
          setWeatherMode('sakura');
          setWeatherKind('sunny');
        }
      } catch {
        // Keep default sakura on network failure
      }
    };

    detectWeather(10.8231, 106.6297);
  }, []);

  const isPullingRef = useRef(false);

  const handlePullFromSheets = async (
    url = sheetUrl,
    allowEmpty = true,
    userOverride?: AppUser | null,
    silent = false
  ) => {
    if (!url || isPullingRef.current) return;
    isPullingRef.current = true;
    if (!silent) setSyncState('syncing');
    setLastSyncError(null);
    try {
      const remote = await fetchFromSheets(url);
      if (allowEmpty || remote.tasks.length > 0 || remote.logs.length > 0) {
        setTasks(remote.tasks);
        setLogs(remote.logs);
      }
      if (remote.users) setRemoteUsers(remote.users);

      const activeUser = userOverride !== undefined ? userOverride : currentUser;
      const serverUser =
        activeUser && remote.users
          ? remote.users.find((u) => u.user_id === activeUser.user_id)
          : undefined;
      const mergedUser =
        activeUser && serverUser ? { ...activeUser, ...serverUser } : activeUser;

      if (mergedUser && serverUser) {
        if (
          mergedUser.partner_id !== activeUser?.partner_id ||
          mergedUser.room_code !== activeUser?.room_code
        ) {
          saveCurrentUser(mergedUser);
          setCurrentUser(mergedUser);
        }
      }

      const myCodeUpper = (mergedUser?.user_id || coupleProfile.myCode || '').toUpperCase();
      const serverProfile = remote.coupleProfiles?.find(
        (p) =>
          (myCodeUpper && p.myCode.toUpperCase() === myCodeUpper) ||
          (mergedUser?.room_code && p.partnerCode.toUpperCase() === mergedUser.room_code.toUpperCase())
      );
      const partnerUser =
        mergedUser?.partner_id && remote.users
          ? remote.users.find((u) => u.user_id === mergedUser.partner_id)
          : undefined;

      if (
        mergedUser &&
        (mergedUser.room_code || mergedUser.partner_id || serverProfile?.isPaired)
      ) {
        setCoupleProfile((prev) => ({
          ...prev,
          myName: mergedUser.display_name || prev.myName,
          myCode: myCodeUpper || prev.myCode,
          partnerCode: (
            mergedUser.room_code ||
            serverProfile?.partnerCode ||
            prev.partnerCode
          ).toUpperCase(),
          partnerName:
            partnerUser?.display_name ||
            serverProfile?.partnerName ||
            mergedUser.partner_id ||
            prev.partnerName,
          isPaired: true,
        }));
      }

      const activeRoom = (
        mergedUser?.room_code ||
        serverProfile?.partnerCode ||
        coupleProfile.partnerCode ||
        coupleProfile.myCode ||
        ''
      ).toUpperCase();
      if (remote.coupleChat) {
        const filteredChat = activeRoom
          ? remote.coupleChat.filter((m) => !m.room_code || m.room_code.toUpperCase() === activeRoom)
          : remote.coupleChat;
        setCoupleChat(
          filteredChat.map((m) => ({
            ...m,
            sender:
              m.sender_id && mergedUser
                ? m.sender_id === mergedUser.user_id
                  ? 'me'
                  : 'partner'
                : m.sender,
          }))
        );
      } else if (allowEmpty) {
        setCoupleChat([]);
      }
      if (remote.coupleNudges) {
        const filteredNudges = activeRoom
          ? remote.coupleNudges.filter((n) => !n.room_code || n.room_code.toUpperCase() === activeRoom)
          : remote.coupleNudges;
        setNudges(
          filteredNudges.map((n) => ({
            ...n,
            from:
              n.sender_id && mergedUser
                ? n.sender_id === mergedUser.user_id
                  ? 'me'
                  : 'partner'
                : n.from,
          }))
        );
      } else if (allowEmpty) {
        setNudges([]);
      }
      if (remote.partnerCheckins) {
        setPartnerCheckins(remote.partnerCheckins);
      } else if (allowEmpty) {
        setPartnerCheckins([]);
      }
      setSyncState('synced');
    } catch (err) {
      setSyncState('error');
      setLastSyncError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      isPullingRef.current = false;
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
    const taggedLog: TaskLog = {
      ...nextLog,
      user_id: nextLog.user_id || currentUser?.user_id,
    };
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.id === taggedLog.id);
      const nextLogs = idx >= 0 ? prev.map((l, i) => (i === idx ? taggedLog : l)) : [...prev, taggedLog];

      // Check if user just reached 100% completion for selectedDate
      const scheduled = myTasks.filter((t) => isTaskScheduledForDate(t, taggedLog.log_date));
      if (scheduled.length > 0 && taggedLog.status === 'completed') {
        const allDoneNow = scheduled.every((t) => {
          const l = nextLogs.find((x) => x.task_id === t.id && x.log_date === taggedLog.log_date);
          return getLogCompletionRatio(t, l) >= 1;
        });
        const wasAllDoneBefore = scheduled.every((t) => {
          const l = prev.find((x) => x.task_id === t.id && x.log_date === taggedLog.log_date);
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
      syncLogToSheets(sheetUrl, taggedLog)
        .then(() => setSyncState('synced'))
        .catch((err) => {
          setSyncState('error');
          setLastSyncError(err instanceof Error ? err.message : 'Lỗi đồng bộ log');
        });

      if (coupleProfile.isPaired && taggedLog.status === 'completed') {
        const task = tasks.find((t) => t.id === taggedLog.task_id);
        if (task) {
          const checkin: PartnerCheckin = {
            id: `pc_${taggedLog.id}`,
            taskTitle: task.title,
            emoji: task.emoji || 'favorite',
            color: task.color || '#F472B6',
            completedAt: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            note: taggedLog.note || undefined,
            photo: taggedLog.photo || '',
            reaction: null,
          };
          setPartnerCheckins((prev) => {
            const exists = prev.some((c) => c.id === checkin.id);
            return exists ? prev.map((c) => (c.id === checkin.id ? checkin : c)) : [checkin, ...prev];
          });
          syncPartnerCheckinToSheets(sheetUrl, checkin).catch(console.error);
        }
      }
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
    const taggedTask: Task = {
      ...task,
      user_id: task.user_id || currentUser?.user_id,
    };
    setTasks((prev) =>
      isEdit ? prev.map((t) => (t.id === taggedTask.id ? taggedTask : t)) : [...prev, taggedTask]
    );
    if (sheetUrl) {
      setSyncState('syncing');
      syncTaskToSheets(sheetUrl, taggedTask)
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

  const myTasks = tasks.filter(
    (t) => !currentUser || !t.user_id || t.user_id === currentUser.user_id
  );
  const myLogs = logs.filter(
    (l) => !currentUser || !l.user_id || l.user_id === currentUser.user_id
  );

  const partnerTasks = currentUser?.partner_id
    ? tasks.filter((t) => t.user_id === currentUser.partner_id)
    : [];
  const partnerLogs = currentUser?.partner_id
    ? logs.filter((l) => l.user_id === currentUser.partner_id)
    : [];

  const handleLoginUser = (user: AppUser) => {
    saveCurrentUser(user);
    setCurrentUser(user);
    setShowUserModal(false);
    const hasServerPair = Boolean(user.room_code || user.partner_id);
    setCoupleProfile((prev) => ({
      ...prev,
      myName: user.display_name,
      myCode: user.user_id.toUpperCase(),
      partnerCode: (user.room_code || (hasServerPair ? prev.partnerCode : '')).toUpperCase(),
      partnerName:
        remoteUsers.find((u) => u.user_id === user.partner_id)?.display_name ||
        user.partner_id ||
        prev.partnerName,
      isPaired: hasServerPair,
    }));
    setRemoteUsers((prev) => {
      const idx = prev.findIndex((u) => u.user_id === user.user_id);
      return idx >= 0 ? prev.map((u, i) => (i === idx ? user : u)) : [...prev, user];
    });
    if (sheetUrl) {
      handlePullFromSheets(sheetUrl, false, user);
    }
  };

  const handleLogoutUser = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setCoupleProfile(createDefaultCoupleProfile());
    setShowUserModal(true);
  };

  const todayKey = toDateKey(new Date());
  const scheduledTodayTasks = myTasks.filter((t) => isTaskScheduledForDate(t, todayKey));
  const pendingTodayTasks = scheduledTodayTasks.filter((t) => {
    const log = myLogs.find((l) => l.task_id === t.id && l.log_date === todayKey);
    if (log?.status === 'skipped') return false;
    return getLogCompletionRatio(t, log) < 1;
  });

  const activeScheduledToday = scheduledTodayTasks.filter((t) => {
    const log = myLogs.find((l) => l.task_id === t.id && l.log_date === todayKey);
    return log?.status !== 'skipped';
  });
  const myPercent =
    activeScheduledToday.length > 0
      ? Math.round(
          (activeScheduledToday.reduce((acc, task) => {
            const log = myLogs.find((l) => l.task_id === task.id && l.log_date === todayKey);
            return acc + getLogCompletionRatio(task, log);
          }, 0) /
            activeScheduledToday.length) *
            100
        )
      : 0;

  const handleReactCheckin = (id: string, reaction: 'heart' | 'clap' | 'fire') => {
    setPartnerCheckins((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, reaction };
        if (sheetUrl) syncPartnerCheckinToSheets(sheetUrl, next).catch(console.error);
        return next;
      })
    );
  };

  const handleUpdateCoupleProfile = (next: CoupleProfile) => {
    let resolvedProfile = next;
    const roomCode = (next.partnerCode || next.myCode || '').trim().toUpperCase();

    if (next.isPaired && currentUser) {
      const matchedPartner = remoteUsers.find(
        (u) =>
          u.user_id !== currentUser.user_id &&
          (u.user_id.toUpperCase() === roomCode ||
            (u.room_code && u.room_code.toUpperCase() === roomCode))
      );
      const updatedUser: AppUser = {
        ...currentUser,
        room_code: roomCode,
        partner_id: matchedPartner?.user_id || currentUser.partner_id,
      };
      saveCurrentUser(updatedUser);
      setCurrentUser(updatedUser);

      if (matchedPartner && (!next.partnerName || next.partnerName === 'Gia Hân')) {
        resolvedProfile = { ...next, partnerName: matchedPartner.display_name };
      }

      if (sheetUrl) {
        pairCoupleOnSheets(sheetUrl, {
          user_id: currentUser.user_id,
          partner_code: roomCode,
          room_code: roomCode,
          partner_name: resolvedProfile.partnerName,
        })
          .then((res) => {
            if (res.user) {
              const mergedUser: AppUser = { ...currentUser, ...res.user };
              saveCurrentUser(mergedUser);
              setCurrentUser(mergedUser);
            }
            if (res.partner) {
              setCoupleProfile((prev) => ({
                ...prev,
                partnerName: res.partner?.display_name || prev.partnerName,
              }));
            }
            handlePullFromSheets(sheetUrl);
          })
          .catch(console.error);
      }
    }

    setCoupleProfile(resolvedProfile);
    if (sheetUrl) syncCoupleProfileToSheets(sheetUrl, resolvedProfile).catch(console.error);
  };

  const handleSendNudge = (message: string) => {
    const newNudge: CoupleNudge = {
      id: `nudge_${Date.now()}`,
      from: 'me',
      sender_id: currentUser?.user_id,
      room_code: currentUser?.room_code || coupleProfile.partnerCode,
      message,
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setNudges((prev) => [newNudge, ...prev].slice(0, 12));
    if (sheetUrl) syncCoupleNudgeToSheets(sheetUrl, newNudge).catch(console.error);
  };

  const handleSendCoupleChat = (text: string) => {
    const now = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newMsg: CoupleChatMessage = {
      id: `chat_${Date.now()}`,
      sender: 'me',
      sender_id: currentUser?.user_id,
      room_code: currentUser?.room_code || coupleProfile.partnerCode,
      text,
      createdAt: now,
    };
    setCoupleChat((prev) => [...prev, newMsg]);
    if (sheetUrl) syncCoupleChatToSheets(sheetUrl, newMsg).catch(console.error);
  };

  const calcWeeklyPercents = (taskList: Task[], logList: TaskLog[]) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dk = toDateKey(d);
      const dayLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
      const scheduled = taskList.filter((t) => isTaskScheduledForDate(t, dk));
      const active = scheduled.filter((t) => {
        const log = logList.find((l) => l.task_id === t.id && l.log_date === dk);
        return log?.status !== 'skipped';
      });
      const pct =
        active.length > 0
          ? Math.round(
              (active.reduce((acc, task) => {
                const log = logList.find((l) => l.task_id === task.id && l.log_date === dk);
                return acc + getLogCompletionRatio(task, log);
              }, 0) /
                active.length) *
                100
            )
          : 0;
      return { label: dayLabel, percent: pct };
    });

  const myWeeklyPercents = calcWeeklyPercents(myTasks, myLogs);
  const realPartnerWeekly =
    coupleProfile.isPaired && (partnerTasks.length > 0 || Boolean(currentUser?.partner_id))
      ? calcWeeklyPercents(partnerTasks, partnerLogs).map((d) => d.percent)
      : undefined;
  const realPartnerTodayPercent =
    realPartnerWeekly !== undefined ? realPartnerWeekly[realPartnerWeekly.length - 1] : undefined;

  useEffect(() => {
    if (!sheetUrl) return;
    handlePullFromSheets(sheetUrl, true);
    const timer = setInterval(() => {
      handlePullFromSheets(sheetUrl, true, undefined, true);
    }, 5_000);
    return () => clearInterval(timer);
  }, [sheetUrl, currentUser?.user_id, coupleProfile.isPaired, coupleProfile.partnerCode]);

  useEffect(() => {
    if (activeTab === 'couple' && sheetUrl && currentUser) {
      handlePullFromSheets(sheetUrl, true);
    }
  }, [activeTab]);

  const latestPartnerNudge = nudges.find((n) => n.from === 'partner');

  const tabOrder: AppTab[] = ['today', 'couple', 'bear3d', 'summary', 'settings'];
  const activeTabIndex = Math.max(0, tabOrder.indexOf(activeTab));

  return (
    <div
      className={`flex min-h-screen justify-center transition-colors duration-500 ${
        isDark ? 'theme-dark bg-[#0b1120]' : 'bg-[#FFF5F8]'
      }`}
    >
      {/* Mobile Miniapp Frame */}
      <div className="miniapp-shell relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#FFFBFD] shadow-[0_0_50px_-12px_rgba(30,58,138,0.14)] transition-colors duration-500">
        {/* Weather-synced Falling Animation Overlay */}
        <WeatherOverlay mode={weatherMode} />

        {/* Frosted Glass iOS Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-pink-100/80 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <div>
            <h1 className="bg-gradient-to-r from-pink-400 to-blue-900 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              DailyLog
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              {activeTab === 'today' && t.appSubtitleToday}
              {activeTab === 'couple' && 'Không gian cặp đôi'}
              {activeTab === 'bear3d' && 'Bé Gấu đồng hành'}
              {activeTab === 'summary' && t.appSubtitleSummary}
              {activeTab === 'settings' && t.appSubtitleSettings}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bell Notices Button */}
            <button
              type="button"
              onClick={() => setShowNudgeNotice((v) => !v)}
              className="ios-press relative flex h-8 w-8 items-center justify-center rounded-full border border-pink-100 bg-pink-50/70 text-blue-900 transition hover:bg-pink-100/70"
              title="Thông báo nhắc nhở"
              aria-label="Thông báo nhắc nhở"
            >
              <GIcon name="notifications_active" size={16} className="text-pink-400" />
              {coupleProfile.isPaired && latestPartnerNudge && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Active User Pill */}
            <button
              type="button"
              onClick={() => setShowUserModal(true)}
              className="ios-press flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-pink-100 bg-pink-50/70 px-2.5 py-1 text-[11px] font-bold text-blue-900 transition hover:bg-pink-100/70"
              title="Tài khoản"
            >
              <GIcon name="person" size={13} className="text-pink-400" />
              <span className="max-w-[72px] truncate">
                {currentUser ? currentUser.display_name : 'Đăng nhập'}
              </span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
          {activeTab === 'today' && (
            <TodayView
              key="today-tab"
              t={t}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              tasks={myTasks}
              logs={myLogs}
              dailyNote={dailyNotes[selectedDate]}
              weatherTip={weatherTip}
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

          {activeTab === 'couple' && (
            <CoupleView
              key="couple-tab"
              myPercent={myPercent}
              myWeeklyPercents={myWeeklyPercents}
              partnerTodayPercent={realPartnerTodayPercent}
              partnerWeeklyPercents={realPartnerWeekly}
              profile={coupleProfile}
              partnerCheckins={partnerCheckins}
              nudges={nudges}
              chatMessages={coupleChat}
              onUpdateProfile={handleUpdateCoupleProfile}
              onReactCheckin={handleReactCheckin}
              onSendNudge={handleSendNudge}
              onSendChat={handleSendCoupleChat}
            />
          )}

          {activeTab === 'bear3d' && <Bear3DStudio key="bear3d-tab" />}

          {activeTab === 'summary' && (
            <SummaryView key="summary-tab" t={t} tasks={myTasks} logs={myLogs} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              key="settings-tab"
              t={t}
              lang={lang}
              themeMode={themeMode}
              isDark={isDark}
              sheetUrl={sheetUrl}
              syncState={syncState}
              lastSyncError={lastSyncError}
              tasks={myTasks}
              logs={myLogs}
              onChangeLang={setLang}
              onChangeTheme={setThemeMode}
              onSaveSheetUrl={handleSaveSheetUrl}
              onPullFromSheets={() => handlePullFromSheets(sheetUrl, true)}
              onPushAllToSheets={handlePushAllToSheets}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>

        {/* Floating iOS Glassmorphic Bottom Navigation */}
        <div className="pointer-events-none fixed bottom-3 z-30 flex w-full max-w-[430px] justify-center px-3">
          <nav className="pointer-events-auto relative grid w-full grid-cols-5 rounded-[26px] border border-pink-100/90 bg-white/85 p-1.5 shadow-[0_10px_35px_-10px_rgba(236,72,153,0.25)] backdrop-blur-xl">
            {/* Sliding active background pill */}
            <div
              className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/5)] rounded-[20px] bg-pink-100/80 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
            />

            {(
              [
                { id: 'today', label: t.navToday, icon: 'check_circle' },
                { id: 'couple', label: 'Couple', icon: 'favorite' },
                { id: 'bear3d', label: 'Gấu 3D', icon: 'pets' },
                { id: 'summary', label: t.navSummary, icon: 'bar_chart' },
                { id: 'settings', label: t.navSettings, icon: 'settings' },
              ] as { id: AppTab; label: string; icon: string }[]
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`ios-press relative z-10 flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[10px] font-bold transition-colors duration-300 ${
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
            t={t}
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
            t={t}
            task={pendingPhotoCheck.task}
            onConfirm={handleConfirmPhotoCheck}
            onCancel={() => setPendingPhotoCheck(null)}
          />
        )}

        {/* Step 1: Setup Google Sheet URL Overlay if not configured */}
        {showSetupOverlay && (
          <SetupSheetOverlayModal
            t={t}
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
            t={t}
            pendingTasks={pendingTodayTasks}
            initialDailyNote={dailyNotes[todayKey]?.text || ''}
            weatherTip={weatherTip}
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
            t={t}
            completedCount={celebrationCount}
            onClose={() => setCelebrationCount(null)}
          />
        )}

        {/* Floating Message Bubble Shortcut on Home */}
        {activeTab === 'today' && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('couple');
              setTimeout(() => {
                document.getElementById('couple-chat-box')?.scrollIntoView({ behavior: 'smooth' });
              }, 160);
            }}
            className="ios-press fixed right-4 bottom-24 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-blue-900 text-white shadow-[0_10px_28px_-6px_rgba(236,72,153,0.55)]"
            title="Nhắn tin Couple"
            aria-label="Nhắn tin Couple"
          >
            <GIcon name="chat_bubble" size={20} />
            {coupleProfile.isPaired && coupleChat.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                {coupleChat.length}
              </span>
            )}
          </button>
        )}

        {/* Partner Nudge Overlay Modal (Bell / App Open) */}
        {showNudgeNotice && ((coupleProfile.isPaired && latestPartnerNudge) || nudges.length > 0) && (
          <div className="animate-ios-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
            <div className="animate-ios-sheet w-full max-w-[375px] rounded-[28px] border border-pink-200 bg-white p-5 shadow-[0_24px_60px_-15px_rgba(30,58,138,0.35)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
                    <GIcon name="notifications_active" size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-blue-950">
                      Thông báo nhắc nhở
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400">
                      {coupleProfile.isPaired
                        ? `Từ ${coupleProfile.partnerName}`
                        : 'Chưa liên kết Couple'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNudgeNotice(false)}
                  className="ios-press flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-slate-500"
                >
                  <GIcon name="close" size={16} />
                </button>
              </div>

              <div className="mt-3.5 max-h-56 space-y-2 overflow-y-auto pr-1">
                {coupleProfile.isPaired ? (
                  nudges.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="rounded-2xl border border-pink-100 bg-pink-50/50 px-3.5 py-2.5"
                    >
                      <div className="flex justify-between text-[10px] font-bold text-pink-500 uppercase">
                        <span>
                          {n.from === 'partner' ? coupleProfile.partnerName : coupleProfile.myName}
                        </span>
                        <span>{n.createdAt}</span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-blue-950">
                        "{n.message}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-pink-50/50 p-3 text-center text-xs font-medium text-slate-500">
                    Bạn chưa kết nối Couple. Vào tab Couple để liên kết với người ấy nhé!
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNudgeNotice(false)}
                  className="ios-press flex-1 rounded-2xl border border-pink-100 bg-pink-50/60 py-2.5 text-xs font-bold text-blue-950"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNudgeNotice(false);
                    setActiveTab('couple');
                  }}
                  className="ios-press flex-1 rounded-2xl bg-blue-900 py-2.5 text-xs font-extrabold text-white"
                >
                  {coupleProfile.isPaired ? 'Trả lời ngay' : 'Liên kết Couple'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Login / Register / Profile Modal */}
        {(showUserModal || (!showSetupOverlay && !currentUser)) && (
          <UserLoginModal
            sheetUrl={sheetUrl}
            currentUser={currentUser}
            coupleProfile={coupleProfile}
            onAuthSuccess={handleLoginUser}
            onLogout={handleLogoutUser}
            onClose={currentUser ? () => setShowUserModal(false) : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default App;
