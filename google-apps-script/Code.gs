/**
 * Google Apps Script - Backend miễn phí dùng Google Sheets làm Database
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Tạo một Google Sheet mới tại https://sheets.new
 * 2. Vào menu: Tiện ích mở rộng (Extensions) -> Apps Script
 * 3. Xóa code mẫu và dán toàn bộ nội dung file này vào
 * 4. Bấm Triển khai (Deploy) -> Triển khai mới (New deployment)
 *    - Loại: Ứng dụng web (Web app)
 *    - Thực thi với tư cách (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 5. Copy URL Web App và dán vào tab "Cài đặt" trên Miniapp.
 */

const SHEET_TASKS = 'tasks';
const SHEET_LOGS = 'task_logs';

const TASK_HEADERS = [
  'id',
  'title',
  'emoji',
  'color',
  'is_recurring',
  'recurrence_days',
  'target_date',
  'target_type',
  'target_value',
  'target_period',
  'unit',
  'default_note',
  'default_note_done',
  'created_at',
  'archived_at',
];

const LOG_HEADERS = [
  'id',
  'task_id',
  'log_date',
  'value',
  'target_snapshot',
  'status',
  'note',
  'photo',
  'updated_at',
];

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToObjects(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return data.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'is_recurring') val = val === true || val === 'true' || val === 'TRUE';
      if (h === 'target_value' || h === 'value' || h === 'target_snapshot') {
        val = Number(val) || 0;
      }
      if (h === 'recurrence_days') {
        if (typeof val === 'string' && val.trim().startsWith('[')) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            val = [];
          }
        } else if (!Array.isArray(val)) {
          val = [];
        }
      }
      if (val === '') val = null;
      obj[h] = val;
    });
    return obj;
  });
}

function upsertRow(sheet, headers, keyField, keyValue, obj) {
  const lastRow = sheet.getLastRow();
  const keyCol = headers.indexOf(keyField) + 1;
  let targetRow = -1;

  if (lastRow > 1) {
    const keys = sheet.getRange(2, keyCol, lastRow - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]) === String(keyValue)) {
        targetRow = i + 2;
        break;
      }
    }
  }

  const rowValues = headers.map((h) => {
    const v = obj[h];
    if (v === null || v === undefined) return '';
    if (Array.isArray(v)) return JSON.stringify(v);
    return v;
  });

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet(e) {
  try {
    const tasksSheet = getOrCreateSheet(SHEET_TASKS, TASK_HEADERS);
    const logsSheet = getOrCreateSheet(SHEET_LOGS, LOG_HEADERS);
    const tasks = sheetToObjects(tasksSheet, TASK_HEADERS);
    const logs = sheetToObjects(logsSheet, LOG_HEADERS);
    return jsonResponse({ ok: true, tasks: tasks, logs: logs });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;

    if (action === 'upsert_task') {
      const sheet = getOrCreateSheet(SHEET_TASKS, TASK_HEADERS);
      upsertRow(sheet, TASK_HEADERS, 'id', body.task.id, body.task);
      return jsonResponse({ ok: true });
    }

    if (action === 'upsert_log') {
      const sheet = getOrCreateSheet(SHEET_LOGS, LOG_HEADERS);
      upsertRow(sheet, LOG_HEADERS, 'id', body.log.id, body.log);
      return jsonResponse({ ok: true });
    }

    if (action === 'bulk_sync') {
      const tasksSheet = getOrCreateSheet(SHEET_TASKS, TASK_HEADERS);
      const logsSheet = getOrCreateSheet(SHEET_LOGS, LOG_HEADERS);
      (body.tasks || []).forEach((t) => upsertRow(tasksSheet, TASK_HEADERS, 'id', t.id, t));
      (body.logs || []).forEach((l) => upsertRow(logsSheet, LOG_HEADERS, 'id', l.id, l));
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}
