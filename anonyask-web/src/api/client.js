import { mockApi } from './mockApi.js';

// Set to false when a real backend is available at localhost:4000
const USE_MOCK = true;

export function getToken() {
  return localStorage.getItem('doubtfix_token');
}

export function setToken(token) {
  localStorage.setItem('doubtfix_token', token);
}

export function clearToken() {
  localStorage.removeItem('doubtfix_token');
}

export async function api(path, { method = 'GET', body } = {}) {
  if (USE_MOCK) {
    try {
      return await mockApi(path, { method, body, token: getToken() });
    } catch (e) {
      throw new Error(e.message || 'Mock API error');
    }
  }

  const BASE = 'http://localhost:4000/api';
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
