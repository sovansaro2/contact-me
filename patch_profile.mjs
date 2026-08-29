import fs from 'fs';
let content = fs.readFileSync('src/services/profileService.ts', 'utf8');

// replace the logic of getPublicProfile
const newGetPublicProfile = `static async getPublicProfile(profileId?: string): Promise<Profile | null> {
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
  }`;

content = content.replace(
  /static async getPublicProfile\(profileId\?: string\): Promise<Profile \| null> \{[\s\S]*?return null;\s*\}\s*catch[^\}]+\}\s*\}/, 
  newGetPublicProfile
);

fs.writeFileSync('src/services/profileService.ts', content);
