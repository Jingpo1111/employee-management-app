import { env } from '../config/env.js';

type AttendanceMessageInput = {
  employeeName: string;
  employeeCode: string;
  dateKey: string;
  checkIn: string | null;
  alreadyClaimed?: boolean;
};

type TelegramSendResult = {
  sent: boolean;
  reason?: string;
};

let cachedChatId: string | undefined;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function resolveTelegramChatId(botToken: string) {
  if (env.telegramChatId) {
    return env.telegramChatId;
  }

  if (cachedChatId) {
    return cachedChatId;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
  if (!response.ok) {
    throw new Error(`Telegram getUpdates failed with status ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    result?: Array<{ message?: { chat?: { id?: number | string } } }>;
  };
  const chatId = [...(payload.result || [])].reverse().find((update) => update.message?.chat?.id)?.message?.chat?.id;
  if (!chatId) {
    throw new Error('Telegram chat ID was not found. Send a message to the bot once, then scan again.');
  }

  cachedChatId = String(chatId);
  return cachedChatId;
}

export async function sendTelegramAttendanceMessage(input: AttendanceMessageInput): Promise<TelegramSendResult> {
  if (!env.telegramBotToken) {
    const reason = 'TELEGRAM_BOT_TOKEN is missing.';
    console.warn(`Telegram notification skipped: ${reason}`);
    return { sent: false, reason };
  }

  const text = [
    input.alreadyClaimed ? '<b>Employee QR scan repeated</b>' : '<b>Employee QR check-in success</b>',
    `Name: ${escapeHtml(input.employeeName)}`,
    `Code: ${escapeHtml(input.employeeCode)}`,
    `Date: ${escapeHtml(input.dateKey)}`,
    `Time: ${escapeHtml(input.checkIn || 'Recorded')}`,
    `Status: ${input.alreadyClaimed ? 'Already checked in today' : 'Attendance recorded'}`
  ].join('\n');

  const chatId = await resolveTelegramChatId(env.telegramBotToken);
  const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: 'HTML',
      text
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram notification failed with status ${response.status}: ${details}`);
  }

  return { sent: true };
}
