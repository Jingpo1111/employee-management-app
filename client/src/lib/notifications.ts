import { Notification, Role } from '../types';

const notificationViewedEvent = 'employee-management-notifications-viewed';

function getNotificationViewedKey(userId: string, role: Role) {
  return `employee-management-notifications-viewed-${role}-${userId}`;
}

export function getNotificationViewedAt(userId?: string, role?: Role) {
  if (!userId || !role) {
    return null;
  }

  return localStorage.getItem(getNotificationViewedKey(userId, role));
}

export function setNotificationsViewedNow(userId: string, role: Role) {
  const timestamp = new Date().toISOString();
  localStorage.setItem(getNotificationViewedKey(userId, role), timestamp);
  window.dispatchEvent(new CustomEvent(notificationViewedEvent, { detail: { userId, role, timestamp } }));
  return timestamp;
}

export function addNotificationViewedListener(callback: () => void) {
  window.addEventListener(notificationViewedEvent, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(notificationViewedEvent, callback);
    window.removeEventListener('storage', callback);
  };
}

export function countNewNotifications(notifications: Notification[], viewedAt: string | null) {
  if (!viewedAt) {
    return notifications.length;
  }

  const viewedTime = new Date(viewedAt).getTime();
  return notifications.filter((notification) => new Date(notification.createdAt).getTime() > viewedTime).length;
}
