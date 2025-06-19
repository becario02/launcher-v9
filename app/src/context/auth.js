'use client'; 
import { createContext, useContext, useState, useEffect } from 'react'; 
import { useRouter, usePathname } from 'next/navigation'; 
import Cookies from 'js-cookie'; 
 
const AuthContext = createContext({}); 
 
export function AuthProvider({ children }) { 
  const [user, setUser] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdvan, setIsAdvan] = useState(false);
  const router = useRouter(); 
  const pathname = usePathname(); 
 
  useEffect(() => {
    // Check for authenticated user
    const authCookie = Cookies.get('auth');
    const profileName = Cookies.get('profileName');
    const isLoginPage = pathname === '/login'; 
    const isRecuperarContraseñaPage = pathname === '/recuperarPassword'; 
    
    // Check if current path is an admin path
    const isAdminPath = pathname.startsWith('/admin/');
    
    // Allow access to these pages without authentication
    const isPublicPage = isLoginPage || isRecuperarContraseñaPage;
    
    console.log('Auth Context Debug:', {
      pathname,
      authCookie: !!authCookie,
      profileName,
      isAdminPath,
      isPublicPage
    });
    
    // Update admin status if cookie exists
    if (profileName) {
      const adminStatus = profileName.includes('ADMIN');
      const advanStatus = profileName.includes('ADVAN');
      setIsAdmin(adminStatus);
      setIsAdvan(advanStatus);
      
      console.log('Role Status:', { adminStatus, advanStatus });
    }
 
    // If not authenticated and not on a public page, redirect to login
    if (!authCookie && !isPublicPage) { 
      console.log('Redirecting to login from auth context');
      router.push('/login'); 
      return;
    } 
    
    // If authenticated but accessing admin page without admin privileges
    if (authCookie && isAdminPath && profileName && !profileName.includes('ADMIN') && !profileName.includes('ADVAN')) {
      console.log('Redirecting to home - no admin privileges');
      router.push('/'); 
      return;
    }
 
    // If authenticated and on login page, redirect to home
    if (authCookie && isLoginPage) { 
      console.log('Redirecting to home from login page');
      router.push('/'); 
    } 
  }, [pathname, router]); 
 
  const login = (userData) => {
    console.log('Login data:', userData);
    
    // Set cookies with proper options
    Cookies.set('auth', 'true', { expires: 7, path: '/' });
    if (userData.profileName) {
      Cookies.set('profileName', userData.profileName, { expires: 7, path: '/' });
    }
    
    // Set isAdmin based on profileName 
    const adminStatus = userData.profileName?.includes('ADMIN');
    const advanStatus = userData.profileName?.includes('ADVAN');
    
    setIsAdmin(adminStatus);
    setIsAdvan(advanStatus);
    setUser({...userData, isAdmin: adminStatus, isAdvan: advanStatus});
    
    console.log('User logged in with roles:', { adminStatus, advanStatus });
    
    router.push('/'); 
  }; 
 
  const logout = () => { 
    setUser(null);
    setIsAdmin(false);
    setIsAdvan(false);
    
    // Clear cookies with proper path
    ['auth', 'tabs', 'activeTabId', 'tabCounter', 'profileName'].forEach(cookieName => { 
      Cookies.remove(cookieName, { path: '/' }); 
    });
    
    // Limpiar datos del localStorage relacionados con la sesión
    localStorage.removeItem('avatarImage');
    
    window.location.href = '/login'; 
  }; 
 
  return ( 
    <AuthContext.Provider value={{ user, isAdmin, isAdvan, login, logout }}> 
      {children} 
    </AuthContext.Provider> 
  ); 
} 
 
export const useAuth = () => useContext(AuthContext);