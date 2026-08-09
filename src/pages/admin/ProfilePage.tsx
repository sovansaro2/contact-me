import { useState, useEffect, FormEvent } from 'react';
import { ProfileService } from '@/services/profileService';
import type { Profile } from '@/types/database.types';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getOwnerProfile();
      if (data) {
        setProfile(data);
      }
    } catch (err: any) {
      console.error(err);
      setError('មិនអាចផ្ទុកព័ត៌មានប្រវត្តិរូបបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await ProfileService.updateOwnerProfile({
        display_name: profile.display_name || null,
        bio: profile.bio || null,
        avatar_url: profile.avatar_url || null,
        cover_url: profile.cover_url || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError('មិនអាចរក្សាទុកបានទេ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ព័ត៌មានផ្ទាល់ខ្លួន</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ឈ្មោះបង្ហាញ (Display Name) *
          </label>
          <input
            type="text"
            required
            value={profile.display_name || ''}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="ឧទាហរណ៍៖ រីម រ៉ាវី"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ការពិពណ៌នាខ្លី (Bio)
          </label>
          <textarea
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
            placeholder="ឧទាហរណ៍៖ សូមជ្រើសរើសវិធីទំនាក់ទំនងដែលអ្នកងាយស្រួលបំផុត"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            រូបភាពប្រវត្តិរូប (Avatar URL)
          </label>
          <input
            type="url"
            value={profile.avatar_url || ''}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="https://example.com/avatar.jpg"
          />
          {profile.avatar_url && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">មើលជាមុន៖</p>
              <img 
                src={profile.avatar_url} 
                alt="Preview" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                onLoad={(e) => (e.currentTarget.style.display = 'block')}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>បានរក្សាទុកដោយជោគជ័យ</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            រក្សាទុក
          </button>
        </div>
      </form>
    </div>
  );
}
