'use client'

import React, { useState } from 'react';
import { User } from 'lucide-react';
import Image from 'next/image';
import ProfilePopup from './ProfilePopup';

const NavbarSelectProfile = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
      <nav className="w-full bg-white border-b border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] px-4 py-2 relative">
        <div className="container mx-auto flex items-center justify-between 2xl:max-w-7xl">
          <div className="flex items-center">
            <div className="h-8 w-32 sm:h-10 sm:w-36 md:h-12 md:w-44 2xl:h-16 2xl:w-56 relative">
              <Image src="/logoAdvan.svg" alt="ADVAN" fill className="object-contain" priority />
            </div>
          </div>

          <div className="flex items-center">
            <button 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <ProfilePopup 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </nav>
    );
};

export default NavbarSelectProfile;