import crypto from 'node:crypto';

const APP_TIMEZONE = 'Asia/Phnom_Penh';

export function getDateKeyInTimezone(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getCheckInTimeLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

export function isLateCheckIn(timeLabel: string) {
  return timeLabel > '08:00';
}

export function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function dateToDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getMonthStartDateKey(dateKey = getDateKeyInTimezone()) {
  return `${dateKey.slice(0, 7)}-01`;
}

export function getPreviousDateKey(dateKey = getDateKeyInTimezone()) {
  const date = dateKeyToDate(dateKey);
  date.setUTCDate(date.getUTCDate() - 1);
  return dateToDateKey(date);
}

export function eachDateKey(startDateKey: string, endDateKey: string) {
  const keys: string[] = [];
  const cursor = dateKeyToDate(startDateKey);
  const end = dateKeyToDate(endDateKey);

  while (cursor <= end) {
    keys.push(dateToDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

export function isWeekdayDateKey(dateKey: string) {
  const day = dateKeyToDate(dateKey).getUTCDay();
  return day >= 1 && day <= 5;
}

export function createQrToken() {
  return crypto.randomBytes(18).toString('base64url');
}
