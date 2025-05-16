'use client'; 
import { createContext, useContext, useState, useEffect } from 'react'; 
import { useRouter, usePathname } from 'next/navigation'; 
import Cookies from 'js-cookie'; 
 
const AuthContext = createContext({}); 
 
export function AuthProvider({ children }) { 
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin status
  const [isAdvan, setIsAdvan] = useState(false); // New state for advan status
  const router = useRouter(); 
  const pathname = usePathname(); 
 
  useEffect(() => {
    // Check for authenticated user
    const authCookie = Cookies.get('auth');
    const profileName = Cookies.get('profileName'); // New cookie for profile
    const isLoginPage = pathname === '/login'; 
    const isRecuperarContraseñaPage = pathname === '/recuperarPassword'; 
    
    // Check if current path is an admin path
    const isAdminPath = pathname.startsWith('/admin/');
    
    // Allow access to these pages without authentication
    const isPublicPage = isLoginPage || isRecuperarContraseñaPage;
    
    // Update admin status if cookie exists
    if (profileName) {
      setIsAdmin(profileName?.includes('ADMIN'));
    }
 
    // If not authenticated and not on a public page, redirect to login
    if (!authCookie && !isPublicPage) { 
      router.push('/login'); 
      return;
    } 
    
    // If authenticated but accessing admin page without admin privileges
    if (authCookie && isAdminPath && !profileName?.includes('ADMIN')) {
      router.push('/'); // Redirect to home if not admin
      return;
    }
 
    // If authenticated and on login page, redirect to home
    if (authCookie && isLoginPage) { 
      router.push('/'); 
    } 
  }, [pathname, router]); 
 
  const login = (userData) => {
    // Set isAdmin based on profileName 
    const adminStatus = userData.profileName?.includes('ADMIN');
    const advanStatus = userData.profileName?.includes('ADVAN');
    setIsAdmin(adminStatus);
    setIsAdvan(advanStatus);
    setUser({...userData, isAdmin: adminStatus});
    router.push('/'); 
  }; 
 
  const logout = () => { 
    setUser(null);
    setIsAdmin(false);
    // Limpiar cookies de auth y tabs 
    ['auth', 'tabs', 'activeTabId', 'tabCounter', 'profileName'].forEach(cookieName => { 
      Cookies.remove(cookieName, { path: '/' }); 
    }); 
    window.location.href = '/login'; 
  }; 
 
  return ( 
    <AuthContext.Provider value={{ user, isAdmin, isAdvan, login, logout }}> 
      {children} 
    </AuthContext.Provider> 
  ); 
} 
 
export const useAuth = () => useContext(AuthContext);