import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);
const KEY = 'bookease_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  });

  const save = (data) => {
    localStorage.setItem(KEY, JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setAuth(null);
  };

  return <Ctx.Provider value={{ auth, save, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);