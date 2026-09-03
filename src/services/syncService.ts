import type { Profile, ContactMethod } from '@/types/database.types';
import { DEFAULT_PROFILE, DEFAULT_CONTACT_METHODS, DEFAULT_USER_ID } from '@/lib/defaultData';

export const STORAGE_KEYS = {
  PROFILE: 'wat_profile_data',
  CONTACT_METHODS: 'wat_contact_methods_data',
  SYNC_URL: 'wat_sync_remote_url',
  LAST_SYNCED: 'wat_last_synced_time',
  ADMIN_PIN: 'wat_admin_pin',
  ADMIN_USER: 'wat_admin_user_session'
};

export interface ExportDataPayload {
  version: number;
  appName: string;
  updatedAt: string;
  profile: Profile;
  contactMethods: ContactMethod[];
}

export class SyncService {
  /**
   * Get the current stored Profile or fallback to default
   */
  static getLocalProfile(): Profile {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.display_name || parsed.id)) {
          return {
            ...DEFAULT_PROFILE,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse local profile:', e);
    }
    return DEFAULT_PROFILE;
  }

  /**
   * Save profile locally
   */
  static saveLocalProfile(profile: Profile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save local profile:', e);
    }
  }

  /**
   * Get the current stored Contact Methods or fallback to default
   */
  static getLocalContactMethods(): ContactMethod[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_METHODS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        }
      }
    } catch (e) {
      console.warn('Failed to parse local contact methods:', e);
    }
    return [...DEFAULT_CONTACT_METHODS].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  /**
   * Save contact methods locally
   */
  static saveLocalContactMethods(methods: ContactMethod[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACT_METHODS, JSON.stringify(methods));
    } catch (e) {
      console.error('Failed to save local contact methods:', e);
    }
  }

  /**
   * Get Sync URL (GitHub Gist or Custom JSON link)
   */
  static getSyncUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.SYNC_URL) || '';
  }

  /**
   * Set Sync URL
   */
  static setSyncUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_URL, url.trim());
  }

  /**
   * Get last synced time formatted
   */
  static getLastSyncedTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
  }

  /**
   * Export full app data to a clean JSON string
   */
  static exportData(): string {
    const payload: ExportDataPayload = {
      version: 1,
      appName: 'វត្តស្នាយដួច',
      updatedAt: new Date().toISOString(),
      profile: this.getLocalProfile(),
      contactMethods: this.getLocalContactMethods()
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Import data from JSON string
   */
  static importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data) throw new Error('ទិន្នន័យទទេ');

      // Check if it's full payload or partial
      const profile = data.profile || (data.display_name ? data : null);
      const contactMethods = data.contactMethods || data.contact_methods || (Array.isArray(data) ? data : null);

      if (profile) {
        const mergedProfile = {
          ...DEFAULT_PROFILE,
          ...profile,
          id: profile.id || DEFAULT_USER_ID,
          updated_at: new Date().toISOString()
        };
        this.saveLocalProfile(mergedProfile);
      }

      if (Array.isArray(contactMethods)) {
        this.saveLocalContactMethods(contactMethods);
      }

      const now = new Date().toLocaleString('km-KH');
      localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, now);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'ទ្រង់ទ្រាយទិន្នន័យមិនត្រឹមត្រូវ' };
    }
  }

  /**
   * Sync from remote GitHub Gist or URL
   */
  static async syncFromRemote(overrideUrl?: string): Promise<{ success: boolean; message: string; dataUpdated?: boolean }> {
    const targetUrl = (overrideUrl || this.getSyncUrl()).trim();

    if (!targetUrl) {
      return {
        success: false,
        message: 'មិនទាន់បានកំណត់តំណភ្ជាប់ GitHub Gist URL សម្រាប់ Update ទេ។ សូមចូលទៅកាន់ Admin Settings ដើម្បីកំណត់។'
      };
    }

    try {
      // Add cache busting param
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set('_t', Date.now().toString());

      const res = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!res.ok) {
        throw new Error(`មិនអាចទាញយកបានទេ (Status: ${res.status})`);
      }

      const text = await res.text();
      const importResult = this.importData(text);

      if (!importResult.success) {
        throw new Error(importResult.error || 'ទិន្នន័យដែលទទួលបានមិនត្រឹមត្រូវ');
      }

      const nowStr = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
      return {
        success: true,
        message: `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានដោយជោគជ័យ! (${nowStr})`,
        dataUpdated: true
      };
    } catch (err: any) {
      return {
        success: false,
        message: `មិនអាចភ្ជាប់ទៅកាន់ប្រភពព័ត៌មានបានទេ: ${err.message || 'សូមពិនិត្យអ៊ីនធឺណិត'}`
      };
    }
  }

  /**
   * Silently check if remote Gist has newer data than local
   */
  static async checkForRemoteUpdates(): Promise<{ hasUpdate: boolean; remoteData?: any }> {
    const targetUrl = this.getSyncUrl().trim();
    if (!targetUrl) return { hasUpdate: false };

    try {
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set('_t', Date.now().toString());

      const res = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!res.ok) return { hasUpdate: false };

      const text = await res.text();
      const remote = JSON.parse(text);
      if (!remote) return { hasUpdate: false };

      // Compare remote data with local data
      const localProfile = this.getLocalProfile();
      const localMethods = this.getLocalContactMethods();

      const remoteProfile = remote.profile || (remote.display_name ? remote : null);
      const remoteMethods = remote.contactMethods || remote.contact_methods || (Array.isArray(remote) ? remote : null);

      let isDifferent = false;

      // Check profile difference
      if (remoteProfile) {
        if (
          remoteProfile.display_name !== localProfile.display_name ||
          remoteProfile.bio !== localProfile.bio ||
          remoteProfile.avatar_url !== localProfile.avatar_url ||
          remoteProfile.updated_at !== localProfile.updated_at
        ) {
          isDifferent = true;
        }
      }

      // Check contact methods difference
      if (remoteMethods && Array.isArray(remoteMethods)) {
        if (remoteMethods.length !== localMethods.length) {
          isDifferent = true;
        } else {
          for (let i = 0; i < remoteMethods.length; i++) {
            const rm = remoteMethods[i];
            const lm = localMethods.find((m) => m.id === rm.id || (m.type === rm.type && m.value === rm.value));
            if (!lm || lm.value !== rm.value || lm.label !== rm.label || lm.enabled !== rm.enabled) {
              isDifferent = true;
              break;
            }
          }
        }
      }

      return { hasUpdate: isDifferent, remoteData: remote };
    } catch {
      return { hasUpdate: false };
    }
  }

  /**
   * Apply already fetched remote data
   */
  static applyRemoteData(remoteData: any): boolean {
    try {
      const jsonStr = typeof remoteData === 'string' ? remoteData : JSON.stringify(remoteData);
      const res = this.importData(jsonStr);
      return res.success;
    } catch {
      return false;
    }
  }

  /**
   * Reset data back to original defaults
   */
  static resetToDefault(): void {
    this.saveLocalProfile(DEFAULT_PROFILE);
    this.saveLocalContactMethods(DEFAULT_CONTACT_METHODS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNCED);
  }
}
