// src/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   try {
     console.log('Verificando usuario almacenado...');
     const storedUser = localStorage.getItem('user');
     if (storedUser) {
       console.log('Usuario encontrado en localStorage:', storedUser);
       setUser(JSON.parse(storedUser));
     } else {
       console.log('No hay usuario en localStorage');
     }
   } catch (error) {
     console.error('Error al recuperar usuario:', error);
   } finally {
     setLoading(false);
   }
 }, []);

 const login = async (credentials) => {
    try {
      const mockUser = {
        id: 1,
        username: credentials.username || 'usuario_ejemplo',
        role: 'user'
      };
      
      // Guardar en cookie además de localStorage
      document.cookie = `user=${JSON.stringify(mockUser)}; path=/`;
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Error durante login:', error);
      throw error;
    }
  };
 const logout = () => {
   console.log('Cerrando sesión...');
   localStorage.removeItem('user');
   setUser(null);
 };

 return (
   <AuthContext.Provider value={{ user, login, logout, loading }}>
     {children}
   </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};