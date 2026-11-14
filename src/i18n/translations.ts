export type AppLang = 'vi' | 'en' | 'zh';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface Translations {
  appSubtitleToday: string;
  appSubtitleSummary: string;
  appSubtitleSettings: string;
  navToday: string;
  navSummary: string;
  navSettings: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  backToToday: string;
  weekdays: string[];
  progressToday: string;
  progress100: string;
  tasksDoneSuffix: string;
  dailyNoteTitle: string;
  dailyNotePlaceholder: string;
  dailyNoteEmpty: string;
  edit: string;
  close: string;
  save: string;
  write: string;
  recurringTasks: string;
  adhocTasks: string;
  addTask: string;
  noRecurring: string;
  addAdhocPrompt: string;
  holdToEdit: string;
  noteBtn: string;
  skipBtn: string;
  unskipBtn: string;
  hideBtn: string;
  skippedToday: string;
  completed: string;
  notCompleted: string;
  noteInlinePlaceholder: string;
  // Weather
  weatherSakura: string;
  weatherRain: string;
  weatherSparkle: string;
  weatherOff: string;
  tipRain: (temp: string) => string;
  tipCloudy: (temp: string) => string;
  tipSunny: (temp: string) => string;
  // Mascot & Modals
  setupBadge: string;
  setupTitle: string;
  setupDesc: string;
  setupBtn: string;
  setupSkip: string;
  welcomePending: (n: number) => string;
  welcomeAllClear: string;
  welcomeDailyNoteLabel: string;
  welcomeDailyNotePlaceholder: string;
  welcomeSaveAndGo: string;
  welcomeGo: string;
  moreTasks: (n: number) => string;
  celebrateBadge: string;
  celebrateTitle: string;
  celebrateDesc: (n: number) => string;
  okay: string;
  // Add/Edit Task Modal
  modalEditTitle: string;
  modalAddTitle: string;
  taskNameLabel: string;
  taskNamePlaceholder: string;
  iconLabel: string;
  colorLabel: string;
  frequencyLabel: string;
  freqRecurring: string;
  freqOneOff: string;
  measureLabel: string;
  measureBool: string;
  measureCount: string;
  targetPerDay: string;
  unitLabel: string;
  taskNoteLabel: string;
  taskNotePlaceholder: string;
  taskNoteDoneLabel: string;
  updateTaskBtn: string;
  saveTaskBtn: string;
  // Photo Modal
  photoTitle: string;
  photoTaskLabel: string;
  photoRetake: string;
  photoPick: string;
  photoProcessing: string;
  photoHint: string;
  photoConfirm: string;
  cancel: string;
  // Summary
  week: string;
  month: string;
  year: string;
  yearSummary: (y: number) => string;
  monthSummary: (m: number, y: number) => string;
  weekTotal: (v: number, u: string) => string;
  daysLabel: string;
  dailyLabel: string;
  less: string;
  // Settings
  syncTitle: string;
  statusLabel: string;
  statusLocal: string;
  statusSyncing: string;
  statusSynced: string;
  statusError: string;
  saveUrlBtn: string;
  pullBtn: string;
  pushBtn: string;
  langTitle: string;
  themeTitle: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  localDataTitle: (t: number, l: number) => string;
  exportJson: string;
  resetDemo: string;
}

export const TRANSLATIONS: Record<AppLang, Translations> = {
  vi: {
    appSubtitleToday: 'Ghi nhận việc hằng ngày',
    appSubtitleSummary: 'Tổng kết tuần • tháng • năm',
    appSubtitleSettings: 'Cài đặt & Google Sheets',
    navToday: 'Hôm nay',
    navSummary: 'Tổng kết',
    navSettings: 'Cài đặt',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    backToToday: 'Về hôm nay',
    weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    progressToday: 'Tiến độ hôm nay',
    progress100: 'Xuất sắc! Hoàn thành 100%',
    tasksDoneSuffix: 'việc đã xong',
    dailyNoteTitle: 'Ghi chú cho',
    dailyNotePlaceholder: 'Nhắc nhở / ghi chú cho ngày này...',
    dailyNoteEmpty: 'Chưa có ghi chú nào cho ngày này.',
    edit: 'Sửa',
    close: 'Đóng',
    save: 'Lưu',
    write: '+ Viết',
    recurringTasks: 'Việc hằng ngày',
    adhocTasks: 'Sự kiện hôm nay',
    addTask: 'Thêm việc',
    noRecurring: 'Hôm nay chưa có việc hằng ngày nào.',
    addAdhocPrompt: '+ Thêm sự kiện riêng cho',
    holdToEdit: 'Nhấn giữ để sửa',
    noteBtn: 'Ghi chú',
    skipBtn: 'Bỏ qua',
    unskipBtn: 'Làm lại',
    hideBtn: 'Ẩn',
    skippedToday: 'Đã bỏ qua hôm nay',
    completed: 'Đã hoàn thành',
    notCompleted: 'Chưa hoàn thành',
    noteInlinePlaceholder: 'Ghi chú nhanh cho việc này...',
    weatherSakura: 'Hoa rơi',
    weatherRain: 'Mưa rơi',
    weatherSparkle: 'Lấp lánh',
    weatherOff: 'Tắt',
    tipRain: (t) => `Ngoài trời đang mưa${t} — ra đường nhớ mặc áo mưa hoặc mang ô nhé!`,
    tipCloudy: (t) => `Trời hơi âm u${t} — ra đường nhớ mang theo áo khoác mỏng hoặc ô phòng hờ nhé!`,
    tipSunny: (t) => `Ngoài trời đang nắng${t} — ra đường nhớ mặc áo khoác và bôi kem chống nắng nhé!`,
    setupBadge: 'THIẾT LẬP BAN ĐẦU',
    setupTitle: 'Chưa có URL Google Sheets',
    setupDesc: 'Dán URL Google Apps Script của bạn vào đây để đồng bộ dữ liệu nhiều thiết bị nhé.',
    setupBtn: 'Lưu & Kết nối',
    setupSkip: 'Để sau',
    welcomePending: (n) => `Hôm nay còn ${n} việc chưa xong nè`,
    welcomeAllClear: 'Chào ngày mới tốt lành!',
    welcomeDailyNoteLabel: 'Ghi chú cho hôm nay',
    welcomeDailyNotePlaceholder: 'Viết nhanh điều cần nhớ cho hôm nay...',
    welcomeSaveAndGo: 'Lưu & Bắt đầu',
    welcomeGo: 'Xem danh sách',
    moreTasks: (n) => `+${n} việc khác...`,
    celebrateBadge: 'HOÀN THÀNH 100%',
    celebrateTitle: 'Tuyệt vời quá đi!',
    celebrateDesc: (n) => `Bạn đã hoàn thành trọn vẹn cả ${n} công việc hôm nay. Nghỉ ngơi và tận hưởng nhé!`,
    okay: 'Xong',
    modalEditTitle: 'Chỉnh sửa công việc',
    modalAddTitle: 'Thêm việc mới',
    taskNameLabel: 'Tên công việc',
    taskNamePlaceholder: 'VD: Uống nước, Đọc sách, Gửi báo cáo...',
    iconLabel: 'Biểu tượng',
    colorLabel: 'Màu sắc',
    frequencyLabel: 'Tần suất',
    freqRecurring: 'Hằng ngày (Lặp lại)',
    freqOneOff: 'Chỉ 1 ngày',
    measureLabel: 'Cách đo lường',
    measureBool: 'Tick hoàn thành',
    measureCount: 'Đếm số lượng',
    targetPerDay: 'Mục tiêu / ngày',
    unitLabel: 'Đơn vị',
    taskNoteLabel: 'Ghi chú cho việc này (tùy chọn)',
    taskNotePlaceholder: 'VD: Mang bình nước 500ml, đọc chương 4...',
    taskNoteDoneLabel: 'Đánh dấu ghi chú đã làm xong',
    updateTaskBtn: 'Cập nhật công việc',
    saveTaskBtn: 'Lưu công việc',
    photoTitle: 'Chụp ảnh xác nhận',
    photoTaskLabel: 'Việc:',
    photoRetake: 'Chụp lại',
    photoPick: 'Mở Camera / Chọn ảnh xác nhận',
    photoProcessing: 'Đang xử lý ảnh...',
    photoHint: 'Ảnh được nén gọn để lưu đồng bộ',
    photoConfirm: 'Xác nhận hoàn thành',
    cancel: 'Hủy',
    week: 'Tuần',
    month: 'Tháng',
    year: 'Năm',
    yearSummary: (y) => `Tổng kết năm ${y}`,
    monthSummary: (m, y) => `Tháng ${m}/${y}`,
    weekTotal: (v, u) => `Tổng tuần: ${v} ${u}`,
    daysLabel: 'ngày',
    dailyLabel: 'Hằng ngày',
    less: 'Ít',
    syncTitle: 'Đồng bộ Google Sheets',
    statusLabel: 'Trạng thái:',
    statusLocal: 'Đang lưu cục bộ (Local)',
    statusSyncing: 'Đang đồng bộ...',
    statusSynced: 'Đã kết nối Google Sheets',
    statusError: 'Lỗi kết nối',
    saveUrlBtn: 'Lưu cấu hình URL',
    pullBtn: 'Tải từ Sheet',
    pushBtn: 'Đẩy lên Sheet',
    langTitle: 'Ngôn ngữ (Language)',
    themeTitle: 'Giao diện (Sáng / Tối)',
    themeAuto: 'Tự động (Tối 18h–6h)',
    themeLight: 'Sáng',
    themeDark: 'Tối',
    localDataTitle: (t, l) => `Dữ liệu cục bộ (${t} việc • ${l} bản ghi)`,
    exportJson: 'Xuất JSON',
    resetDemo: 'Khôi phục mẫu',
  },
  en: {
    appSubtitleToday: 'Daily habit & task log',
    appSubtitleSummary: 'Weekly • Monthly • Yearly',
    appSubtitleSettings: 'Settings & Google Sheets',
    navToday: 'Today',
    navSummary: 'Summary',
    navSettings: 'Settings',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    backToToday: 'Back to Today',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    progressToday: "Today's progress",
    progress100: 'Awesome! 100% completed',
    tasksDoneSuffix: 'tasks done',
    dailyNoteTitle: 'Note for',
    dailyNotePlaceholder: 'Quick reminder or note for today...',
    dailyNoteEmpty: 'No notes for this day yet.',
    edit: 'Edit',
    close: 'Close',
    save: 'Save',
    write: '+ Write',
    recurringTasks: 'Recurring',
    adhocTasks: 'One-off Today',
    addTask: 'Add Task',
    noRecurring: 'No recurring tasks scheduled for today.',
    addAdhocPrompt: '+ Add a one-off task for',
    holdToEdit: 'Hold to edit',
    noteBtn: 'Note',
    skipBtn: 'Skip',
    unskipBtn: 'Unskip',
    hideBtn: 'Hide',
    skippedToday: 'Skipped today',
    completed: 'Completed',
    notCompleted: 'Not completed',
    noteInlinePlaceholder: 'Quick note for this task...',
    weatherSakura: 'Petals',
    weatherRain: 'Rain',
    weatherSparkle: 'Sparkle',
    weatherOff: 'Off',
    tipRain: (t) => `It's raining outside${t} — remember a raincoat or umbrella!`,
    tipCloudy: (t) => `It's cloudy outside${t} — bring a light jacket or umbrella just in case!`,
    tipSunny: (t) => `It's sunny outside${t} — wear a jacket and put on sunscreen!`,
    setupBadge: 'INITIAL SETUP',
    setupTitle: 'No Google Sheets URL yet',
    setupDesc: 'Paste your Google Apps Script URL here to sync your data across devices.',
    setupBtn: 'Save & Connect',
    setupSkip: 'Later, use Local only',
    welcomePending: (n) => `${n} tasks left for today`,
    welcomeAllClear: 'Have a wonderful day!',
    welcomeDailyNoteLabel: 'Note for today',
    welcomeDailyNotePlaceholder: 'Write something to remember today...',
    welcomeSaveAndGo: 'Save & View Tasks',
    welcomeGo: 'View Tasks',
    moreTasks: (n) => `+${n} more tasks...`,
    celebrateBadge: '100% COMPLETED',
    celebrateTitle: 'Amazing job!',
    celebrateDesc: (n) => `You completed all ${n} tasks today. Time to relax and enjoy!`,
    okay: 'Okay',
    modalEditTitle: 'Edit Task',
    modalAddTitle: 'New Task',
    taskNameLabel: 'Task Name',
    taskNamePlaceholder: 'e.g. Drink water, Read book, Send report...',
    iconLabel: 'Icon',
    colorLabel: 'Color',
    frequencyLabel: 'Frequency',
    freqRecurring: 'Recurring',
    freqOneOff: 'One-off day',
    measureLabel: 'Measurement',
    measureBool: 'Checkmark',
    measureCount: 'Counter',
    targetPerDay: 'Target / day',
    unitLabel: 'Unit',
    taskNoteLabel: 'Task note (optional)',
    taskNotePlaceholder: 'e.g. Bring 500ml bottle, read chapter 4...',
    taskNoteDoneLabel: 'Mark note as done',
    updateTaskBtn: 'Update Task',
    saveTaskBtn: 'Save Task',
    photoTitle: 'Photo Verification',
    photoTaskLabel: 'Task:',
    photoRetake: 'Retake',
    photoPick: 'Open Camera / Choose Photo',
    photoProcessing: 'Processing image...',
    photoHint: 'Compressed automatically for sync',
    photoConfirm: 'Confirm Completion',
    cancel: 'Cancel',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    yearSummary: (y) => `${y} In-Review`,
    monthSummary: (m, y) => `Month ${m}/${y}`,
    weekTotal: (v, u) => `Week total: ${v} ${u}`,
    daysLabel: 'days',
    dailyLabel: 'Everyday',
    less: 'Less',
    syncTitle: 'Google Sheets Sync',
    statusLabel: 'Status:',
    statusLocal: 'Local Storage only',
    statusSyncing: 'Syncing...',
    statusSynced: 'Connected to Google Sheets',
    statusError: 'Connection error',
    saveUrlBtn: 'Save URL',
    pullBtn: 'Pull from Sheet',
    pushBtn: 'Push to Sheet',
    langTitle: 'Language',
    themeTitle: 'Appearance (Light / Dark)',
    themeAuto: 'Auto (Dark 6PM–6AM)',
    themeLight: 'Light',
    themeDark: 'Dark',
    localDataTitle: (t, l) => `Local Data (${t} tasks • ${l} logs)`,
    exportJson: 'Export JSON',
    resetDemo: 'Reset Demo',
  },
  zh: {
    appSubtitleToday: '每日任务与习惯记录',
    appSubtitleSummary: '每周 • 每月 • 年度总结',
    appSubtitleSettings: '设置与 Google Sheets',
    navToday: '今天',
    navSummary: '总结',
    navSettings: '设置',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    backToToday: '回到今天',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    progressToday: '今日进度',
    progress100: '太棒了！已完成 100%',
    tasksDoneSuffix: '项已完成',
    dailyNoteTitle: '今日备忘：',
    dailyNotePlaceholder: '写下今天的备忘或提醒...',
    dailyNoteEmpty: '今天还没有备忘记录。',
    edit: '编辑',
    close: '关闭',
    save: '保存',
    write: '+ 写备忘',
    recurringTasks: '固定任务',
    adhocTasks: '今日临时',
    addTask: '添加任务',
    noRecurring: '今天没有安排固定任务。',
    addAdhocPrompt: '+ 添加临时任务：',
    holdToEdit: '长按编辑',
    noteBtn: '备注',
    skipBtn: '跳过',
    unskipBtn: '取消跳过',
    hideBtn: '隐藏',
    skippedToday: '今日已跳过',
    completed: '已完成',
    notCompleted: '未完成',
    noteInlinePlaceholder: '为此任务添加备注...',
    weatherSakura: '落樱',
    weatherRain: '下雨',
    weatherSparkle: '微光',
    weatherOff: '关闭',
    tipRain: (t) => `外面正在下雨${t} — 出门记得穿雨衣或带伞哦！`,
    tipCloudy: (t) => `今天天气阴凉${t} — 出门记得带件薄外套或雨伞备用哦！`,
    tipSunny: (t) => `外面阳光很好${t} — 出门记得穿防晒衣并涂防晒霜哦！`,
    setupBadge: '初始设置',
    setupTitle: '尚未配置 Google Sheets',
    setupDesc: '粘贴你的 Google Apps Script URL，即可在多设备间同步数据。',
    setupBtn: '保存并连接',
    setupSkip: '稍后再说，先用本地存储',
    welcomePending: (n) => `今天还有 ${n} 项任务未完成哦`,
    welcomeAllClear: '祝你拥有美好的一天！',
    welcomeDailyNoteLabel: '今日备忘',
    welcomeDailyNotePlaceholder: '快速记下今天要注意的事情...',
    welcomeSaveAndGo: '保存并查看任务',
    welcomeGo: '查看任务',
    moreTasks: (n) => `还有 ${n} 项...`,
    celebrateBadge: '完成 100%',
    celebrateTitle: '太厉害啦！',
    celebrateDesc: (n) => `你已经完成了今天的全部 ${n} 项任务，好好休息一下吧！`,
    okay: 'Okay',
    modalEditTitle: '编辑任务',
    modalAddTitle: '新建任务',
    taskNameLabel: '任务名称',
    taskNamePlaceholder: '例如：喝水、读书、发日报...',
    iconLabel: '图标',
    colorLabel: '颜色',
    frequencyLabel: '频率',
    freqRecurring: '固定重复',
    freqOneOff: '仅此一天',
    measureLabel: '记录方式',
    measureBool: '勾选完成',
    measureCount: '计数目标',
    targetPerDay: '每日目标',
    unitLabel: '单位',
    taskNoteLabel: '任务备注（可选）',
    taskNotePlaceholder: '例如：带500ml水杯、读第4章...',
    taskNoteDoneLabel: '标记备注已完成',
    updateTaskBtn: '更新任务',
    saveTaskBtn: '保存任务',
    photoTitle: '拍照打卡确认',
    photoTaskLabel: '任务：',
    photoRetake: '重拍',
    photoPick: '打开相机 / 选择照片',
    photoProcessing: '正在处理图片...',
    photoHint: '照片会自动压缩以便同步',
    photoConfirm: '确认完成',
    cancel: '取消',
    week: '周',
    month: '月',
    year: '年',
    yearSummary: (y) => `${y} 年度总结`,
    monthSummary: (m, y) => `${y}年 ${m}月`,
    weekTotal: (v, u) => `本周累计：${v} ${u}`,
    daysLabel: '天',
    dailyLabel: '每天',
    less: '少',
    syncTitle: 'Google Sheets 同步',
    statusLabel: '状态：',
    statusLocal: '仅本地存储',
    statusSyncing: '正在同步...',
    statusSynced: '已连接 Google Sheets',
    statusError: '连接失败',
    saveUrlBtn: '保存 URL',
    pullBtn: '从表格下载',
    pushBtn: '上传到表格',
    langTitle: '语言 (Language)',
    themeTitle: '外观模式 (浅色 / 深色)',
    themeAuto: '自动 (18:00–06:00 深色)',
    themeLight: '浅色',
    themeDark: '深色',
    localDataTitle: (t, l) => `本地数据 (${t} 项任务 • ${l} 条记录)`,
    exportJson: '导出 JSON',
    resetDemo: '恢复示例',
  },
};
