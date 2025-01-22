'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ModulesSection from '@/components/ModulesSection';
import ModulesCatalog from '@/components/ModulesCatalog';
import NewsSection from '@/components/NewsSection';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No hay usuario autenticado, redirigiendo a login...');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#f8fcff] to-[#edf8ff]">
          <div className="space-y-8">
            <ModulesSection />
            <ModulesCatalog />
            <NewsSection />
          </div>
        </main>
      </div>
    </div>
  );
}