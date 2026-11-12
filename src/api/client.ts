import { Capacitor } from '@capacitor/core';

export const APP_VERSION = '1.0.0';

export interface ApiClientConfig {
  baseUrl: string;
  isCustomUrl: boolean;
}

const STORAGE_KEY_BASE_URL = 'ck_custom_api_base_url';
const STORAGE_KEY_ACCESS_TOKEN = 'ck_mobile_access_token';
const STORAGE_KEY_REFRESH_TOKEN = 'ck_mobile_refresh_token';

// Default URL: If Capacitor mobile, fallback to localhost:8000 or custom IP; else 127.0.0.1:8000
const DEFAULT_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem(STORAGE_KEY_BASE_URL);
  if (custom) return custom.trim().replace(/\/+$/, '');
  return DEFAULT_URL.replace(/\/+$/, '');
}

export function setApiBaseUrl(url: string): { success: boolean; error?: string } {
  const cleaned = url.trim().replace(/\/+$/, '');
  // HTTPS Enforcement: In non-localhost production environments, enforce HTTPS
  const isLocal = cleaned.includes('localhost') || cleaned.includes('127.0.0.1') || cleaned.includes('10.0.2.2');
  if (!isLocal && !cleaned.startsWith('https://')) {
    return {
      success: false,
      error: 'Security Policy: Production server URL must use HTTPS (https://). Cleartext HTTP is prohibited.',
    };
  }
  localStorage.setItem(STORAGE_KEY_BASE_URL, cleaned);
  return { success: true };
}

export function resetApiBaseUrl(): void {
  localStorage.removeItem(STORAGE_KEY_BASE_URL);
}

// Token Storage
export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN),
  };
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken);
  }
}

export function clearStoredTokens(): void {
  localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
}

// Global update required callback listener
type UpdateRequiredListener = (info: { minVersion: string; updateUrl: string; message: string }) => void;
let updateRequiredListener: UpdateRequiredListener | null = null;

export function onUpdateRequired(listener: UpdateRequiredListener): void {
  updateRequiredListener = listener;
}

// Global server wake-up listener
type ServerWakeListener = (isWaking: boolean, retryCount: number) => void;
let serverWakeListener: ServerWakeListener | null = null;

export function onServerWakeState(listener: ServerWakeListener): void {
  serverWakeListener = listener;
}

// Mutex for token refresh to prevent concurrency races
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Robust Core Fetch Wrapper with:
 * - Version contract header (X-App-Version)
 * - Mobile / Web client identification (X-Client)
 * - Automatic Token Attachment
 * - Token rotation & race-safe refresh
 * - Cold-start retry handling
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const isMobile = Capacitor.isNativePlatform();

  const headers = new Headers(options.headers || {});
  headers.set('X-App-Version', APP_VERSION);
  headers.set('X-Client', isMobile ? 'mobile' : 'web');

  const { accessToken } = getStoredTokens();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: isMobile ? 'omit' : 'include',
    });

    // Handle 426 Upgrade Required
    if (response.status === 426) {
      const data = await response.json();
      if (updateRequiredListener) {
        updateRequiredListener({
          minVersion: data.minSupportedVersion || '1.0.0',
          updateUrl: data.updateUrl || 'https://github.com/team-dosa/carbon-kheti/releases',
          message: data.message || 'Please update app to latest version.',
        });
      }
      throw new Error(`UPDATE_REQUIRED: ${data.message}`);
    }

    // Handle 401 Unauthorized -> Attempt Token Refresh (for mobile)
    if (response.status === 401 && isMobile) {
      const { refreshToken } = getStoredTokens();
      if (refreshToken && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-App-Version': APP_VERSION,
                'X-Client': 'mobile',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              setStoredTokens(refreshData.accessToken, refreshData.refreshToken);
              isRefreshing = false;
              onRefreshed(refreshData.accessToken);
              // Retry original request
              headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
              return apiRequest<T>(path, { ...options, headers }, 0);
            } else {
              clearStoredTokens();
              isRefreshing = false;
            }
          } catch (err) {
            clearStoredTokens();
            isRefreshing = false;
          }
        } else {
          // Wait for active refresh
          return new Promise<T>((resolve) => {
            subscribeTokenRefresh((newToken) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              resolve(apiRequest<T>(path, { ...options, headers }, 0));
            });
          });
        }
      }
    }

    if (!response.ok) {
      let errDetail = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        errDetail = errJson.detail || errJson.message || errDetail;
      } catch {}
      throw new Error(errDetail);
    }

    return await response.json();
  } catch (err: any) {
    // Cold start / Network wake-up detection
    const isNetworkError =
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError');

    if (isNetworkError && retries > 0) {
      if (serverWakeListener) serverWakeListener(true, 3 - retries);
      // Exponential backoff wait (e.g. 2s, 4s)
      await new Promise((r) => setTimeout(r, 2000 * (3 - retries)));
      return apiRequest<T>(path, options, retries - 1);
    }

    if (serverWakeListener) serverWakeListener(false, 0);
    throw err;
  }
}
