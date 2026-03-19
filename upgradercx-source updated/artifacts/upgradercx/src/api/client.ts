/**
 * HTTP Client — configured for Laravel Sanctum (SPA mode) or token-based auth.
 *
 * Laravel setup required:
 * - config/cors.php → supports_credentials = true
 * - config/sanctum.php → stateful domains includes frontend origin
 * - .env → SESSION_DOMAIN, SANCTUM_STATEFUL_DOMAINS
 *
 * For SPA auth (cookie-based): set VITE_AUTH_MODE=cookie
 * For API token auth (mobile/3rd-party): set VITE_AUTH_MODE=token (default)
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types';

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'token'; // 'token' | 'cookie'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  withCredentials: AUTH_MODE === 'cookie', // Required for Laravel Sanctum SPA auth
});

/* ── CSRF cookie fetcher ── */
let csrfPromise: Promise<void> | null = null;

async function ensureCsrfCookie(): Promise<void> {
  if (AUTH_MODE !== 'cookie') return;
  if (!csrfPromise) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    csrfPromise = axios
      .get(`${baseUrl}/sanctum/csrf-cookie`, { withCredentials: true })
      .then(() => { /* cookie set */ })
      .catch((err) => {
        console.error('[API] Failed to fetch CSRF cookie:', err);
        csrfPromise = null; // Allow retry
      });
  }
  return csrfPromise;
}

/* ── Request interceptor: attach Bearer token (token mode) ── */
client.interceptors.request.use((config) => {
  if (AUTH_MODE === 'token') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response interceptor: handle 401 retry + 419 CSRF refresh ── */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (config: InternalAxiosRequestConfig) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve({} as InternalAxiosRequestConfig);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 429 Too Many Requests → notify user with retry-after
    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      console.warn(`[API] Rate limited — retry after ${seconds}s`);
      window.dispatchEvent(new CustomEvent('api:rate-limited', { detail: { retryAfter: seconds } }));
      return Promise.reject(error);
    }

    // 419 CSRF token mismatch → re-fetch cookie and retry once
    if (status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[API] CSRF token expired — refreshing');
      csrfPromise = null; // Force re-fetch
      await ensureCsrfCookie();
      return client(originalRequest);
    }

    // 401 Unauthenticated → attempt token refresh, then retry
    if (status === 401 && !originalRequest._retry) {
      if (AUTH_MODE === 'token') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken && !isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const { data } = await axios.post(`${baseUrl}/auth/refresh`, { refresh_token: refreshToken });

            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);

            client.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

            processQueue(null);
            return client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError);
            // Refresh failed → force logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                const token = localStorage.getItem('access_token');
                if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              },
              reject,
            });
          });
        }
      }

      // No refresh token available → force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export { client };

/**
 * Fetch Laravel Sanctum CSRF cookie before login (SPA auth mode only).
 * Call this before POST /login when using cookie-based auth.
 */
export { ensureCsrfCookie as fetchCsrfCookie };

/* ── Mock helpers ── */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Simulate Laravel's LengthAwarePaginator response */
export function mockPaginated<T>(items: T[], params?: Record<string, unknown>) {
  const page = Number(params?.page) || 1;
  const perPage = Number(params?.per_page) || 15;
  const start = (page - 1) * perPage;
  const sliced = items.slice(start, start + perPage);
  return {
    data: sliced,
    meta: {
      current_page: page,
      last_page: Math.ceil(items.length / perPage),
      per_page: perPage,
      total: items.length,
    },
    links: {
      first: '?page=1',
      last: `?page=${Math.ceil(items.length / perPage)}`,
      prev: page > 1 ? `?page=${page - 1}` : null,
      next: start + perPage < items.length ? `?page=${page + 1}` : null,
    },
  };
}

/**
 * Extract Laravel 422 validation errors into a flat record.
 */
export function parseValidationErrors(error: unknown): Record<string, string> {
  const axiosErr = error as AxiosError<ApiErrorResponse>;
  const fieldErrors = axiosErr?.response?.data?.errors;
  if (!fieldErrors) return {};
  const flat: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    flat[field] = messages[0];
  }
  return flat;
}

/**
 * Get a human-readable error message from any API error.
 */
export function getErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<ApiErrorResponse>;
  return axiosErr?.response?.data?.message || axiosErr?.message || 'An unexpected error occurred';
}
