import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApi } from './mockApi.js';

const USE_MOCK = true;
const BASE = 'http://localhost:4000/api';

export async function getToken() {
  return AsyncStorage.getItem('anonyask_token');
}

export async function setToken(token) {
  return AsyncStorage.setItem('anonyask_token', token);
}

export async function clearToken() {
  return AsyncStorage.removeItem('anonyask_token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = await getToken();

  if (USE_MOCK) {
    try {
      return await mockApi(path, { method, body, token });
    } catch (e) {
      throw new Error(e.message || 'Mock API error');
    }
  }

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
