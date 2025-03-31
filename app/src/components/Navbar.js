'use client';

import React, { useState } from 'react';
import {
  Bell,
  User,
  ChevronDown,
  Zap,
  Building2,
  Menu,
} from 'lucide-react';
import ModuleTabs from './ModuleTabs';
import ProfilePopup from './ProfilePopup';
import { useTabs } from '@/context/tabs';

const Navbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { tabs } = useTabs();
  const showTabs = tabs.length > 0;

  return (
    <nav className={`w-full bg-white relative z-20 ${showTabs ? 'pb-0' : 'py-0'}`}>
      <div className="w-full flex h-16 border-b border-gray-200 items-center">
        {/* Mobile menu button */}
        <div className="md:hidden px-4">
          <button onClick={onMenuClick} className="text-gray-700 hover:text-black">
            <Menu size={24} />
          </button>
        </div>

        {/* Main navbar content */}
        <div className="flex-1 max-w-7xl mx-auto flex items-center justify-between px-6">
          {/* Selector de empresa */}
          <div className="flex items-center gap-2 text-sm">
            <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50">
              <Building2 size={16} className="text-gray-500" />
              EMPRESA 1
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Botones derechos */}
          <div className="flex items-center gap-6">
            {/* Centro de ayuda */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
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
            <div className="flex items-center gap-2 text-sm text-gray-700">
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

      {/* Black alert bar */}
      <div className="bg-black text-white text-sm px-6 py-2 flex justify-between items-center">
        <span>
          <strong>Nueva actualización del sistema 12 octubre 2024 14:00 hrs</strong>
          &nbsp; Toma las precauciones pertinentes
        </span>
        <button className="bg-white text-black text-xs font-medium px-3 py-1 rounded hover:bg-gray-100">
          Entendido
        </button>
      </div>

      {/* Tabs */}
      <ModuleTabs />

      {/* Profile dropdown */}
      <ProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </nav>
  );
};

export default Navbar;