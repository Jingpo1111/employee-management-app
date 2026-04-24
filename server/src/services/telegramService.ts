import { env } from '../config/env.js';

type AttendanceMessageInput = {
  employeeName: string;
  employeeCode: string;
  dateKey: string;
  checkIn: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendTelegramAttendanceMessage(input: AttendanceMessageInput) {
  if (!env.telegramBotToken || !env.telegramChatId) {
    console.warn('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.');
    return;
  }

  const text = [
    '<b>Employee QR check-in success</b>',
    `Name: ${escapeHtml(input.employeeName)}`,
    `Code: ${escapeHtml(input.employeeCode)}`,
    `Date: ${escapeHtml(input.dateKey)}`,
    `Time: ${escapeHtml(input.checkIn || 'Recorded')}`
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.telegramChatId,
      parse_mode: 'HTML',
      text
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram notification failed with status ${response.status}: ${details}`);
  }
}
