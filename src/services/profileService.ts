import { db, auth, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Profile } from '@/types/database.types';

export class ProfileService {
  static async getPublicProfile(profileId?: string): Promise<Profile | null> {
    try {
      if (profileId) {
        const docRef = doc(db, 'profiles', profileId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as Profile;
        }
      } else {
        // Fallback: Get the first profile available in the DB (for single-user apps)
        const { collection, getDocs, limit, query } = await import('firebase/firestore');
        const q = query(collection(db, 'profiles'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as Profile;
        }
      }
      return null;
    } catch (err: any) {
      console.warn('Error fetching public profile:', err.message || err);
      return null;
    }
  }

  static async getOwnerProfile(): Promise<Profile | null> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Profile;
      } else {
        const newProfile: Profile = {
          id: user.uid,
          display_name: user.displayName || null,
          bio: null,
          avatar_url: user.photoURL || null,
          cover_url: null,
          theme_settings: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        return newProfile;
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async updateOwnerProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const docRef = doc(db, 'profiles', user.uid);
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Use setDoc with merge to ensure it creates if not exists
      await setDoc(docRef, updateData, { merge: true });
      
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.data() as Profile;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  static async uploadAvatar(file: File): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `avatars/${user.uid}/${fileName}`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      
      const url = await getDownloadURL(storageRef);
      return `${url}?t=${new Date().getTime()}`;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
