'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import WelcomeSection from '@/components/WelcomeSection';
import LastSessionCard from '@/components/LastSessionCard';
const DirectAccessSection = dynamic(() => import('@/components/DirectAccessSection'), { ssr: false });
import ModuleGridSection from '@/components/ModuleGridSection';
import NotificationsPanel from '@/components/NotificationsPanel';
import NewsCarousel from '@/components/NewsCarousel';
import HelpCenterCard from '@/components/HelpCenterCard';
import PromotionCard from '@/components/PromotionCard';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-[#F2F6FD] pt-14 pb-14">
          <div className="max-w-5xl mx-auto px-6 space-y-6">
            <div className="flex items-start  flex-wrap  sm:gap-6 md:gap-4 lg:gap-12 gap-4">
              <WelcomeSection />
              <LastSessionCard />
            </div>

            <DirectAccessSection />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-3">
                <ModuleGridSection />
              </div>
              <div className="lg:col-span-1">
                <NotificationsPanel />
              </div>
            </div>

            {/* Nueva fila de contenedores - con la misma estructura que la fila superior */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-3">
                {/* Contenedores a la izquierda (3 columnas) */}
                {/* Reemplazamos el primer contenedor con el carrusel de noticias */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <NewsCarousel />
                  </div>
                  <HelpCenterCard />
                </div>
              </div>
              <div className="lg:col-span-1">
                {/* Contenedor de Promoción (derecha) */}
                <div className="lg:col-span-1">
                  <PromotionCard />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}