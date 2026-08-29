import { useState, useEffect, FormEvent } from 'react';
import { ProfileService } from '@/services/profileService';
import type { Profile } from '@/types/database.types';
import { Save, AlertCircle, CheckCircle2, ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useRef, ChangeEvent } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('ទំហំឯកសារធំពេក។ អតិបរមា 5MB។');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('ប្រភេទឯកសារមិនត្រូវបានគាំទ្រ។ សូមប្រើប្រាស់ PNG, JPG ឬ WebP។');
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const publicUrl = await ProfileService.uploadAvatar(file);
      
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      
      await ProfileService.updateOwnerProfile({
        display_name: profile.display_name || null,
        display_name_en: profile.display_name_en || null,
        bio: profile.bio || null,
        bio_en: profile.bio_en || null,
        avatar_url: publicUrl,
        cover_url: profile.cover_url || null,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError('មិនអាចអាប់ឡូតរូបភាពបានទេ');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        display_name_en: profile.display_name_en || null,
        bio: profile.bio || null,
        bio_en: profile.bio_en || null,
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
            ឈ្មោះបង្ហាញភាសាអង់គ្លេស (Display Name EN)
          </label>
          <input
            type="text"
            value={profile.display_name_en || ''}
            onChange={(e) => setProfile({ ...profile, display_name_en: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="Example: Rim Ravi"
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
            ការពិពណ៌នាខ្លីភាសាអង់គ្លេស (Bio EN)
          </label>
          <textarea
            rows={3}
            value={profile.bio_en || ''}
            onChange={(e) => setProfile({ ...profile, bio_en: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Example: Please select your preferred contact method"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            រូបភាពប្រវត្តិរូប
          </label>
          
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100" onError={(e) => { e.currentTarget.src = ''; setProfile({ ...profile, avatar_url: null }); }} />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              
              
              <div className="flex flex-col gap-2 items-start">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium text-sm"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingAvatar ? 'កំពុងអាប់ឡូត...' : 'ប្តូររូបភាព'}
                </button>
                <p className="text-xs text-gray-500">គាំទ្រទម្រង់ JPG, PNG ឬ WebP (អតិបរមា 5MB)</p>
              </div>
            </div>
          </div>
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
