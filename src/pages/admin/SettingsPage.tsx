import { useState, useEffect, FormEvent } from 'react';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';
import { Save, AlertCircle, CheckCircle2, Key } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [theme, setTheme] = useState({
    backgroundColor: '#F9FAFB',
    cardColor: '#FFFFFF',
    primaryColor: '#111827',
    textColor: '#111827'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getOwnerProfile();
      if (data) {
        setProfile(data);
        if (data.theme_settings && typeof data.theme_settings === 'object') {
          const t = data.theme_settings as any;
          setTheme({
            backgroundColor: t.backgroundColor || '#F9FAFB',
            cardColor: t.cardColor || '#FFFFFF',
            primaryColor: t.primaryColor || '#111827',
            textColor: t.textColor || '#111827'
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('មិនអាចផ្ទុកការកំណត់បានទេ');
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
        theme_settings: theme as any,
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

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordMessage(null);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMessage('ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ');
      setNewPassword('');
      setTimeout(() => setPasswordMessage(null), 5000);
    }
    setPasswordSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">ការកំណត់រូបរាង (Theme)</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ពណ៌ផ្ទៃខាងក្រោយ (Background Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ពណ៌កាត (Card Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.cardColor}
                  onChange={(e) => setTheme({ ...theme, cardColor: e.target.value })}
                  className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.cardColor}
                  onChange={(e) => setTheme({ ...theme, cardColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ពណ៌ចម្បង (Primary Color / Hover)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ពណ៌អក្សរ (Text Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                  className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl border border-gray-200" style={{ backgroundColor: theme.backgroundColor }}>
            <p className="text-sm text-gray-500 mb-4 bg-white/80 inline-block px-2 py-1 rounded">មើលជាមុន (Preview)</p>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: theme.textColor }}>ឈ្មោះបង្ហាញ</h2>
            </div>
            <div className="p-4 rounded-xl shadow-sm border border-black/5 flex items-center justify-between" style={{ backgroundColor: theme.cardColor }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80" style={{ backgroundColor: theme.primaryColor, color: '#fff' }}>
                  <span className="text-xl">★</span>
                </div>
                <span className="font-medium text-gray-900">តេស្ត (Test)</span>
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

      <div>
        <h2 className="text-xl font-bold mb-6">សុវត្ថិភាព (Security)</h2>
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ពាក្យសម្ងាត់ថ្មី (New Password)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              disabled={passwordSaving}
            />
          </div>

          {passwordError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{passwordError}</p>
            </div>
          )}

          {passwordMessage && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{passwordMessage}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {passwordSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Key className="w-5 h-5" />
              )}
              ផ្លាស់ប្តូរពាក្យសម្ងាត់
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
