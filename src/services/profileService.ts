import type { Profile } from '@/types/database.types';
import { getApiUrl } from '@/lib/apiConfig';
import { SyncService } from './syncService';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export class ProfileService {
  static getLocalProfile(): Profile {
    return SyncService.getLocalProfile();
  }

  static async getPublicProfile(_profileId?: string): Promise<Profile | null> {
    // Return instantly from local database/cache (0ms wait time)
    return SyncService.getLocalProfile();
  }

  static async getOwnerProfile(): Promise<Profile | null> {
    // Return local profile instantly
    return SyncService.getLocalProfile();
  }

  static async updateOwnerProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    const current = SyncService.getLocalProfile();
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Save locally immediately
    SyncService.saveLocalProfile(updated);

    // Try optional background sync to server if token exists (non-blocking)
    const token = getToken();
    if (token) {
      fetch(getApiUrl('/api/profiles/me'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      }).catch(() => {
        // Silent ignore for server errors
      });
    }

    return updated;
  }

  static async uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

