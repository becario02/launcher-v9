'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Menu } from 'lucide-react';
import ModuleTabs from './ModuleTabs';
import ProfilePopup from './ProfilePopup';
import NotificationsPopup from './NotificationsPopup';
import HelpCenterModal from './HelpCenterModal';
import { useTabs } from '@/context/tabs';
import CompanySelector from './CompanySelector';
import { useTheme } from '@/context/theme';
import { useCompany } from '@/context/CompanyContext';
import Cookies from 'js-cookie';

const Navbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const { tabs } = useTabs();
  const { theme, setTheme } = useTheme();
  const { showCompanyModal, setShowCompanyModal } = useCompany();
  const showTabs = tabs.length > 0;

  // Obtener nombre + primer apellido directamente de la cookie
  const getUserShortName = () => {
    const fullName = Cookies.get('fullname');
    if (!fullName) return '';
    const parts = decodeURIComponent(fullName).split(' ');
    return `${parts[0]} ${parts[1] || ''}`;
  };

  const userShortName = getUserShortName();

  return (
    <>
      <nav className="sticky top-0 w-full bg-white dark:bg-[#1c1c24] z-20">
        <div className="w-full flex h-24 items-center border-b border-gray-200 dark:border-gray-700">
          {/* Mobile menu */}
          <div className="md:hidden px-4">
            <button onClick={onMenuClick} className="text-gray-700 dark:text-gray-300 hover:text-black">
              <Menu size={24} />
            </button>
          </div>

          {/* Main navbar */}
          <div className="flex-1 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-16">
            {/* Selector de empresa */}
            <div className="hidden md:block w-40 sm:w-auto mr-4">
              <CompanySelector />
            </div>

            {/* Botones derechos */}
            <div className="flex items-center gap-6 lg:gap-12 pr-4">
              {/* Centro de ayuda */}
              <div className="flex items-center gap-2 text-[13px] font-normal">
                <button 
                  onClick={() => setIsHelpCenterOpen(true)}
                  className="w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#2c2c38]"
                >
                  <Image
                    src="/assets/navbar/icon-frame.svg"
                    alt="Centro de ayuda"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </button>
                <span 
                  onClick={() => setIsHelpCenterOpen(true)}
                  className="hidden lg:inline font-[Poppins] font-semibold text-sm tracking-[0.1px] text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  Centro de ayuda
                </span>
              </div>

              {/* Notificaciones */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all 
                    border ${isNotificationsOpen
                      ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#2c2c38]'}`}
                >
                  <Image
                    src={`/assets/navbar/${isNotificationsOpen ? 'icon-frame-12' : 'icon-frame-11'}.svg`}
                    alt="Notificaciones"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </button>
                <span className="absolute -top-1.5 -right-1.5 bg-[#fc5a5a] text-white text-[12px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold">
                  2
                </span>
              </div>

              {/* Perfil */}
              <div className="flex items-center gap-2 text-[13px] font-normal">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-9 h-9 border rounded-full overflow-hidden transition-all
                    ${isProfileOpen ? 'border-[#0080ff]' : 'border-white dark:border-gray-700'}`}
                >
                  <Image
                    src="/assets/navbar/perfil.jpg"
                    alt="Perfil"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </button>
                <span
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span
                    className={`hidden lg:inline font-semibold text-sm tracking-[0.1px] font-[Poppins]
                      ${isProfileOpen ? 'text-[#171725] dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    {userShortName || 'Usuario'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`hidden lg:inline transition-transform duration-200 ${isProfileOpen
                      ? 'text-[#0080ff] rotate-180'
                      : 'text-gray-600 dark:text-gray-400 rotate-0'
                      }`}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ModuleTabs />

        {/* Popups */}
        <ProfilePopup
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
        <NotificationsPopup
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      </nav>
    </>
  );
};

export default Navbar;