'use client';

import React, { useState } from 'react';
import {
  Bell,
  User,
  ChevronDown,
  Zap,
  Menu,
} from 'lucide-react';
import ModuleTabs from './ModuleTabs';
import ProfilePopup from './ProfilePopup';
import { useTabs } from '@/context/tabs';
import CompanySelector from './CompanySelector';

const Navbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { tabs } = useTabs();
  const showTabs = tabs.length > 0;

  return (
    <>
      {/* Navbar con posición sticky */}
      <nav className="sticky top-0 w-full bg-white z-20">
        <div className="w-full flex h-24 border-b border-gray-200 items-center">
          {/* Mobile menu */}
          <div className="md:hidden px-4">
            <button onClick={onMenuClick} className="text-gray-700 hover:text-black">
              <Menu size={24} />
            </button>
          </div>

          {/* Main navbar */}
          <div className="flex-1 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-16">
            {/* Selector de empresa */}
            <CompanySelector />

            {/* Botones derechos */}
            <div className="flex items-center gap-6 pr-4">
              {/* Centro de ayuda */}
              <div className="flex items-center gap-2 text-[13px] text-gray-600 font-normal">
                <button className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
                  <Zap size={16} />
                </button>
                <span className="hidden sm:inline">Centro de ayuda</span>
              </div>

              {/* Notificaciones */}
              <div className="relative">
                <button className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
                  <Bell size={18} className="text-gray-700" />
                </button>
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] px-1 py-0.5 rounded-full leading-none">
                  2
                </span>
              </div>

              {/* Perfil */}
              <div className="flex items-center gap-2 text-[13px] text-gray-600 font-normal">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                >
                  <User size={16} />
                </button>
                <span
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="hidden sm:inline">Luis González</span>
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ModuleTabs />

        {/* Profile popup */}
        <ProfilePopup
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </nav>
      
      {/* Alerta de actualización - después del navbar */}
      <div className="bg-black text-white text-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center py-3">
          <p className="text-[13px] leading-snug">
            <strong>Nueva actualización del sistema 12 octubre 2024 14:00 hrs</strong>{' '}
            <span className="text-gray-300">Toma las precauciones pertinentes</span>
          </p>
          <button className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-100">
            Entendido
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;