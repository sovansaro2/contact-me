import type { ContactMethod } from '@/types/database.types';
import { getApiUrl } from '@/lib/apiConfig';
import { SyncService } from './syncService';
import { DEFAULT_USER_ID } from '@/lib/defaultData';

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

export class ContactMethodService {
  static getLocalContactMethods(): ContactMethod[] {
    return SyncService.getLocalContactMethods();
  }

  static async getPublicContactMethods(_profileId?: string): Promise<ContactMethod[]> {
    // Return local contact methods immediately without blocking network calls
    return SyncService.getLocalContactMethods().filter(m => m.enabled !== false);
  }

  static async getOwnerContactMethods(): Promise<ContactMethod[]> {
    return SyncService.getLocalContactMethods();
  }

  static async createContactMethod(
    method: Omit<ContactMethod, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
  ): Promise<ContactMethod> {
    const list = SyncService.getLocalContactMethods();
    const newId = 'method_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newMethod: ContactMethod = {
      id: newId,
      profile_id: DEFAULT_USER_ID,
      type: method.type,
      label: method.label,
      value: method.value,
      icon: method.icon ?? null,
      enabled: method.enabled ?? true,
      sort_order: list.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedList = [...list, newMethod];
    SyncService.saveLocalContactMethods(updatedList);

    // Optional background sync
    const token = getToken();
    if (token) {
      fetch(getApiUrl('/api/contact-methods'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(method)
      }).catch(() => {});
    }

    return newMethod;
  }

  static async updateContactMethod(
    id: string,
    updates: Partial<Omit<ContactMethod, 'id' | 'profile_id'>>
  ): Promise<ContactMethod> {
    const list = SyncService.getLocalContactMethods();
    let updatedTarget: ContactMethod | null = null;

    const updatedList = list.map(item => {
      if (item.id === id) {
        updatedTarget = {
          ...item,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return updatedTarget;
      }
      return item;
    });

    if (updatedTarget) {
      SyncService.saveLocalContactMethods(updatedList);
    }

    // Optional background sync
    const token = getToken();
    if (token) {
      fetch(getApiUrl(`/api/contact-methods/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      }).catch(() => {});
    }

    return updatedTarget || (list.find(i => i.id === id) as ContactMethod);
  }

  static async deleteContactMethod(id: string): Promise<void> {
    const list = SyncService.getLocalContactMethods();
    const updatedList = list.filter(item => item.id !== id);
    SyncService.saveLocalContactMethods(updatedList);

    // Optional background sync
    const token = getToken();
    if (token) {
      fetch(getApiUrl(`/api/contact-methods/${id}`), {
        method: 'DELETE',
        headers: getHeaders()
      }).catch(() => {});
    }
  }

  static async toggleContactMethod(id: string, enabled: boolean): Promise<ContactMethod> {
    return this.updateContactMethod(id, { enabled });
  }

  static async reorderContactMethods(orderedIds: string[]): Promise<void> {
    const list = SyncService.getLocalContactMethods();
    const map = new Map(list.map(item => [item.id, item]));
    const reordered: ContactMethod[] = [];

    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, sort_order: idx });
        map.delete(id);
      }
    });

    // Add any remaining items
    map.forEach(item => {
      reordered.push({ ...item, sort_order: reordered.length });
    });

    SyncService.saveLocalContactMethods(reordered);

    // Optional background sync
    const token = getToken();
    if (token) {
      fetch(getApiUrl('/api/contact-methods/reorder'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ orderedIds })
      }).catch(() => {});
    }
  }
}

