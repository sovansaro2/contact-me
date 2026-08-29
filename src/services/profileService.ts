import type { Profile } from '@/types/database.types';

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
  static async getPublicProfile(profileId?: string): Promise<Profile | null> {
    try {
      const response = await fetch(`/api/profiles/public/${profileId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.profile;
    } catch (err: any) {
      console.warn('Error fetching public profile:', err.message || err);
      return null;
    }
  }

  static async getOwnerProfile(): Promise<Profile | null> {
    try {
      const response = await fetch('/api/profiles/me', { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      return data.profile;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async updateOwnerProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    try {
      const response = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      return data.profile;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async uploadAvatar(file: File): Promise<string> {
    // For now, since we haven't implemented file storage on Sabay Cloud,
    // let's return a fake placeholder or throw an error indicating we need S3/bucket.
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
