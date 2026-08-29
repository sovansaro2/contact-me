import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      setAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {mode === 'register' ? 'ចុះឈ្មោះគណនីថ្មី' : 'ចូលគ្រប់គ្រង'}
          </h1>
          <p className="text-gray-500 text-sm">
            បញ្ចូលព័ត៌មានគណនីរបស់អ្នក
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">អ៊ីមែល</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ពាក្យសម្ងាត់</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'កំពុងដំណើរការ...' : (mode === 'register' ? 'ចុះឈ្មោះ' : 'ចូល')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button 
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors block w-full"
          >
            {mode === 'login' ? 'មិនទាន់មានគណនី? ចុះឈ្មោះទីនេះ' : '← ត្រលប់ទៅការចូលគណនី'}
          </button>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors block w-full">
            ← ត្រលប់ទៅទំព័រដើម
          </a>
        </div>
      </div>
    </div>
  );
}
