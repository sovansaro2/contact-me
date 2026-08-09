import { supabase, checkSupabaseConfig } from '@/lib/supabase';
import type { Database, Profile } from '@/types/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export class ProfileService {
  /**
   * Fetch the public profile for a given user ID.
   * If there is only one owner in this app, we might just fetch the first profile we find
   * or a specific well-known ID if passed.
   */
  static async getPublicProfile(profileId?: string): Promise<Profile | null> {
    try {
      checkSupabaseConfig();
      let query = supabase.from('profiles').select('*');
      
      if (profileId) {
        query = query.eq('id', profileId);
      }
      
      const { data, error } = await query.limit(1).single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(`Failed to fetch public profile: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      if (err.message !== 'Supabase configuration is missing or invalid.') {
        console.warn(err.message || err);
      }
      return null;
    }
  }

  /**
   * Fetch the currently authenticated owner's profile.
   */
  static async getOwnerProfile(): Promise<Profile | null> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // If not found, create a blank profile
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: session.user.id })
            .select()
            .single();
            
          if (insertError) throw new Error(`Failed to create owner profile: ${insertError.message}`);
          return newProfile;
        }
        throw new Error(`Failed to fetch owner profile: ${error.message}`);
      }

      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Update or create the owner's profile.
   */
  static async updateOwnerProfile(updates: Omit<ProfileUpdate, 'id'>): Promise<Profile> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Attempt to upsert the profile.
      // Upsert relies on the primary key, which is the user's ID.
      const payload: ProfileInsert = {
        id: session.user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (error) throw new Error(`Failed to update profile: ${error.message}`);
      if (!data) throw new Error('Failed to update profile: No data returned');

      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
