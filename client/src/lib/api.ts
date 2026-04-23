import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const tokenStorageKey = 'employee-management-token';
const userStorageKey = 'employee-management-user';

export function getStoredToken() {
  return localStorage.getItem(tokenStorageKey);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(tokenStorageKey, token);
  localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}

export function getStoredUser() {
  const value = localStorage.getItem(userStorageKey);
  return value ? (JSON.parse(value) as User) : null;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(payload.message || 'Request failed.');
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.blob() as T;
}

export async function downloadFile(path: string, fileName: string) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    throw new Error('Failed to export file.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
