import { db, auth } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import type { ContactMethod } from '@/types/database.types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class ContactMethodService {
  static async getPublicContactMethods(profileId: string): Promise<ContactMethod[]> {
    try {
      const q = query(
        collection(db, 'contact_methods'),
        where('profile_id', '==', profileId)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data() as ContactMethod);
      return docs
        .filter(d => d.enabled)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (err: any) {
      console.warn(err.message || err);
      return [];
    }
  }

  static async getOwnerContactMethods(): Promise<ContactMethod[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const q = query(
        collection(db, 'contact_methods'),
        where('profile_id', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data() as ContactMethod);
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async createContactMethod(
    method: Omit<ContactMethod, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
  ): Promise<ContactMethod> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const newId = generateId();
      const payload: ContactMethod = {
        ...method,
        id: newId,
        profile_id: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const docRef = doc(db, 'contact_methods', newId);
      await setDoc(docRef, payload);
      return payload;
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
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const docRef = doc(db, 'contact_methods', id);
      const payload = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await updateDoc(docRef, payload);
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.data() as ContactMethod;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async deleteContactMethod(id: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const docRef = doc(db, 'contact_methods', id);
      await deleteDoc(docRef);
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
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const updates = orderedIds.map(async (id, index) => {
        const docRef = doc(db, 'contact_methods', id);
        return updateDoc(docRef, { sort_order: index });
      });
      await Promise.all(updates);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
