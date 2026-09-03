import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApiUrl } from './apiConfig';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  signOut: () => void;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('local_user_session');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ id: 'local_admin', email: 'admin@watsnaydouch.site' });
        }
        setLoading(false);
        return;
      }

      fetch(getApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('local_user_session', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .catch(() => {
        // In offline/standalone mode, if there is a token, keep session active
        const fallbackUser = { id: 'local_admin', email: 'admin@watsnaydouch.site' };
        setUser(fallbackUser);
        localStorage.setItem('local_user_session', JSON.stringify(fallbackUser));
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setAuth = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('local_user_session', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('local_user_session');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    setAuth,
    signOut,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
