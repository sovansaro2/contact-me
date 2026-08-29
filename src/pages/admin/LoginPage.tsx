import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  type Mode = 'login' | 'register' | 'reset';
  const [mode, setMode] = useState<Mode>('login');

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setMessage('តំណភ្ជាប់សម្រាប់ផ្លាស់ប្តូរពាក្យសម្ងាត់ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នកហើយ។');
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (mode === 'reset') {
        setError(err.message || 'បរាជ័យក្នុងការផ្ញើអ៊ីមែល');
      } else if (mode === 'register') {
        setError(err.message || 'បរាជ័យក្នុងការចុះឈ្មោះ');
      } else {
        setError('អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ');
      }
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'មានបញ្ហាពេលចូលគណនី Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {mode === 'reset' ? 'ភ្លេចពាក្យសម្ងាត់' : mode === 'register' ? 'ចុះឈ្មោះគណនីថ្មី' : 'ចូលគ្រប់គ្រង'}
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === 'reset' 
              ? 'បញ្ចូលអ៊ីមែលដើម្បីទទួលបានតំណភ្ជាប់' 
              : 'បញ្ចូលព័ត៌មានគណនីរបស់អ្នក ឬ ចូលតាម Google'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              អ៊ីមែល
            </label>
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

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  ពាក្យសម្ងាត់
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    ភ្លេចពាក្យសម្ងាត់?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={mode !== 'reset'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {mode === 'reset' ? 'ផ្ញើតំណភ្ជាប់' : mode === 'register' ? 'ចុះឈ្មោះ' : 'ចូល (Email)'}
          </button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ឬ</span>
          </div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          ចូលជាមួយ Google
        </button>
        
        {mode !== 'login' && (
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← ត្រលប់ទៅការចូលគណនី
            </button>
          </div>
        )}
        
        {mode === 'login' && (
          <div className="mt-6 text-center space-y-3">
            <button 
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors block w-full"
            >
              មិនទាន់មានគណនី? ចុះឈ្មោះទីនេះ
            </button>
            <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors block w-full">
              ← ត្រលប់ទៅទំព័រដើម
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
