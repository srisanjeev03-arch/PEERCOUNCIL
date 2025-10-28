import { useState, useContext, createContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentAuthPage, setCurrentAuthPage] = useState('login');

  // Hydrate user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved user', e);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // In a real app, you would store the token in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const googleSignIn = async () => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          return reject(new Error('Google OAuth not initialized'));
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'openid profile email',
          callback: async (tokenResponse) => {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (!res.ok) throw new Error('Failed to fetch Google profile');
              const profile = await res.json();
              const normalized = {
                id: profile.sub,
                name: profile.name || profile.email?.split('@')[0] || 'User',
                email: profile.email,
                avatar: profile.picture,
                isGoogleUser: true
              };
              login(normalized);
              resolve(normalized);
            } catch (e) {
              reject(e);
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (e) {
        reject(e);
      }
    });
  };

  const setAuthPage = (page) => {
    setCurrentAuthPage(page);
  };

  const value = {
    user,
    login,
    logout,
    googleSignIn,
    currentAuthPage,
    setAuthPage,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};