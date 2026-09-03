import { Capacitor } from '@capacitor/core';

// For Web, default to relative path (empty string)
// For Capacitor Android App, default to the production server so the app can fetch data without configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (Capacitor.isNativePlatform() || window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost' && window.location.port !== '3000'
    ? 'https://contact.watsnaydouch.site'
    : '');

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
