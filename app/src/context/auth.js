'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authCookie = Cookies.get('auth');
    const isLoginPage = pathname === '/login';

    if (!authCookie && !isLoginPage) {
      router.push('/login');
    }

    if (authCookie && isLoginPage) {
      router.push('/');
    }
  }, [pathname, router]);

  const login = (userData) => {
    setUser(userData);
    router.push('/select-profile');
  };

  const logout = () => {
    setUser(null);
    // Limpiar cookies de auth y tabs
    ['auth', 'tabs', 'activeTabId', 'tabCounter'].forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);