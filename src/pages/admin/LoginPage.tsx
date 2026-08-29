import { useState, FormEvent } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  type Mode = 'login' | 'register' | 'reset';
  const [mode, setMode] = useState<Mode>('login');

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
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
              : 'បញ្ចូលព័ត៌មានគណនីរបស់អ្នក'}
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
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
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
            {mode === 'reset' ? 'ផ្ញើតំណភ្ជាប់' : mode === 'register' ? 'ចុះឈ្មោះ' : 'ចូល'}
          </button>
        </form>
        
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
