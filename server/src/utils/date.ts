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

export function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function createQrToken() {
  return crypto.randomBytes(18).toString('base64url');
}
