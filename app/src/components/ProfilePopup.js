'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';

const ProfilePopup = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleLogout = () => {
    Cookies.remove('auth');
    logout();
  };

  useEffect(() => {
    let timers = [];
    if (isOpen) {
      setMounted(true);
      timers.push(setTimeout(() => setShowAnimation(true), 50));
    } else {
      setShowAnimation(false);
      timers.push(setTimeout(() => setMounted(false), 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      <div className={`fixed inset-0 z-40 ${showAnimation ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />

      <div
        className={`fixed top-0 right-0 mt-[110px] mr-4 sm:mr-4 md:mr-16 w-48 bg-white dark:bg-[#1C1C24] 
          rounded-2xl shadow-xl border border-gray-100 dark:border-[#2C2C38] z-50 transition-all duration-200
          ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="p-4 space-y-2">
          <button
            className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38] px-3 py-2 rounded-lg transition"
          >
            <User className="w-4 h-4" />
            Perfil
          </button>

          <button
            onClick={() => {
              router.push('/settings');
              onClose();
            }}
            className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38] px-3 py-2 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38] px-3 py-2 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;
