import type { ContactMethod } from '@/types/database.types';

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
  static async getPublicContactMethods(profileId: string): Promise<ContactMethod[]> {
    try {
      const response = await fetch(`/api/contact-methods/public/${profileId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.contactMethods;
    } catch (err: any) {
      console.warn(err.message || err);
      return [];
    }
  }

  static async getOwnerContactMethods(): Promise<ContactMethod[]> {
    try {
      const response = await fetch('/api/contact-methods/me', { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch contact methods');
      const data = await response.json();
      return data.contactMethods;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async createContactMethod(
    method: Omit<ContactMethod, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
  ): Promise<ContactMethod> {
    try {
      const response = await fetch('/api/contact-methods', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(method)
      });
      if (!response.ok) throw new Error('Failed to create method');
      const data = await response.json();
      return data.contactMethod;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async updateContactMethod(
    id: string,
    updates: Partial<Omit<ContactMethod, 'id' | 'profile_id'>>
  ): Promise<ContactMethod> {
    try {
      const response = await fetch(`/api/contact-methods/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update method');
      const data = await response.json();
      return data.contactMethod;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async deleteContactMethod(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/contact-methods/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete method');
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async toggleContactMethod(id: string, enabled: boolean): Promise<ContactMethod> {
    return this.updateContactMethod(id, { enabled });
  }

  static async reorderContactMethods(orderedIds: string[]): Promise<void> {
    try {
      const response = await fetch('/api/contact-methods/reorder', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ orderedIds })
      });
      if (!response.ok) throw new Error('Failed to reorder');
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
