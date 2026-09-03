import { useState, type FormEvent } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/apiConfig';
import AdminDataSyncManager from '@/components/AdminDataSyncManager';

export default function SettingsPage() {
  const { user, setAuth } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មីមិនផ្ទៀងផ្ទាត់គ្នាទេ' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    // Save offline admin credentials locally
    if (newPassword) {
      localStorage.setItem('wat_admin_password', newPassword);
    }
    if (email) {
      const updatedUser = { id: user?.id || 'local_admin', email };
      localStorage.setItem('local_user_session', JSON.stringify(updatedUser));
    }
    
    try {
      const token = localStorage.getItem('token');
      if (token && !token.startsWith('local_token_')) {
        const res = await fetch(getApiUrl('/api/auth/update-account'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            currentPassword,
            newPassword
          })
        });
        
        const data = await res.json();
        if (res.ok && data.token) {
          setAuth(data.token, data.user);
        }
      }

      setMessage({ type: 'success', text: 'ការផ្លាស់ប្តូរត្រូវបានរក្សាទុកដោយជោគជ័យ' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // Still succeed locally
      setMessage({ type: 'success', text: 'បានរក្សាទុកពាក្យសម្ងាត់ក្នុងម៉ាស៊ីនដោយជោគជ័យ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ការកំណត់ (Settings)</h1>
        <p className="text-gray-500">គ្រប់គ្រងគណនី និងសុវត្ថិភាពរបស់អ្នក</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">ព័ត៌មានគណនី</h2>
            <p className="text-sm text-gray-500 mt-1">ផ្លាស់ប្តូរអ៊ីមែលសម្រាប់គណនីរបស់អ្នក</p>
          </div>
          
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">អ៊ីមែល (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
            <p className="text-sm text-gray-500 mt-1">ទុកចន្លោះទទេប្រសិនបើអ្នកមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់</p>
          </div>
          
          <div className="p-6 space-y-5">
            {message && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="ចាំបាច់ប្រសិនបើចង់ប្តូរពាក្យសម្ងាត់ថ្មី"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ពាក្យសម្ងាត់ថ្មី (New Password)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm New Password)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
                minLength={6}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              រក្សាទុកការផ្លាស់ប្តូរ
            </button>
          </div>
        </div>
      </form>

      {/* GitHub Gist Sync & Data Management */}
      <div className="mt-8">
        <AdminDataSyncManager />
      </div>
    </div>
  );
}