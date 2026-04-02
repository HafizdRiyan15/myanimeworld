import { useState, useEffect, createContext, useContext } from 'react';
import { getMe } from '../lib/api';
import { saveToken, saveUser, clearAuth, getToken, getUser } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((res) => { setUser(res.data); saveUser(res.data); })
        .catch(() => clearAuth())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    saveToken(token);
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
