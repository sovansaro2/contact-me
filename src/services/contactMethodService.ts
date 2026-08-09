import { supabase, checkSupabaseConfig } from '@/lib/supabase';
import type { Database, ContactMethod } from '@/types/database.types';

type ContactMethodInsert = Database['public']['Tables']['contact_methods']['Insert'];
type ContactMethodUpdate = Database['public']['Tables']['contact_methods']['Update'];

export class ContactMethodService {
  /**
   * Fetch all ENABLED contact methods for a public profile.
   */
  static async getPublicContactMethods(profileId: string): Promise<ContactMethod[]> {
    try {
      checkSupabaseConfig();
      // RLS ensures only enabled ones are returned for anonymous, but we can be explicit
      const { data, error } = await supabase
        .from('contact_methods')
        .select('*')
        .eq('profile_id', profileId)
        .eq('enabled', true)
        .order('sort_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch public contact methods: ${error.message}`);
      return data || [];
    } catch (err: any) {
      if (err.message !== 'Supabase configuration is missing or invalid.') {
        console.warn(err.message || err);
      }
      return [];
    }
  }

  /**
   * Fetch ALL contact methods for the currently authenticated owner.
   */
  static async getOwnerContactMethods(): Promise<ContactMethod[]> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contact_methods')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('sort_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch owner contact methods: ${error.message}`);
      return data || [];
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Create a new contact method for the owner.
   */
  static async createContactMethod(
    method: Omit<ContactMethodInsert, 'id' | 'profile_id'>
  ): Promise<ContactMethod> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const payload: ContactMethodInsert = {
        ...method,
        profile_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('contact_methods')
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(`Failed to create contact method: ${error.message}`);
      if (!data) throw new Error('Failed to create contact method: No data returned');

      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Update a specific contact method.
   */
  static async updateContactMethod(
    id: string,
    updates: Omit<ContactMethodUpdate, 'id' | 'profile_id'>
  ): Promise<ContactMethod> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contact_methods')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', session.user.id) // Extra safety, RLS already enforces this
        .select()
        .single();

      if (error) throw new Error(`Failed to update contact method: ${error.message}`);
      if (!data) throw new Error('Failed to update contact method: No data returned');

      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Delete a contact method.
   */
  static async deleteContactMethod(id: string): Promise<void> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contact_methods')
        .delete()
        .eq('id', id)
        .eq('profile_id', session.user.id);

      if (error) throw new Error(`Failed to delete contact method: ${error.message}`);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Toggle the enabled status of a contact method.
   */
  static async toggleContactMethod(id: string, enabled: boolean): Promise<ContactMethod> {
    return this.updateContactMethod(id, { enabled });
  }

  /**
   * Reorder contact methods based on a new array of IDs.
   */
  static async reorderContactMethods(orderedIds: string[]): Promise<void> {
    try {
      checkSupabaseConfig();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Update sort_order for each ID
      // In a real production app with many items, a bulk update RPC might be better,
      // but for < 10 contact methods, parallel updates are fine.
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('contact_methods')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('profile_id', session.user.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to reorder some contact methods: ${errors[0].error?.message}`);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
