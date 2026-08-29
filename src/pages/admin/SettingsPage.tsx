import { useState } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const { user } = useAuth();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មីមិនផ្ទៀងផ្ទាត់គ្នាទេ' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      // Not implemented on backend yet for simplicity
      setMessage({ type: 'error', text: 'ការផ្លាស់ប្តូរពាក្យសម្ងាត់មិនទាន់ត្រូវបានបើកដំណើរការទេ' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'មានបញ្ហាពេលប្តូរពាក្យសម្ងាត់' });
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">ព័ត៌មានគណនី</h2>
          <p className="text-sm text-gray-500 mt-1">អ៊ីមែលដែលអ្នកកំពុងប្រើប្រាស់</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-500 block mb-1">អ៊ីមែលរបស់អ្នក</span>
            <span className="font-medium text-gray-900">{user?.email || 'មិនមាន'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h2>
          <p className="text-sm text-gray-500 mt-1">ការពារគណនីរបស់អ្នកដោយប្រើពាក្យសម្ងាត់ថ្មី</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ពាក្យសម្ងាត់ថ្មី</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white"
              required
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
      </form>
    </div>
  );
}
