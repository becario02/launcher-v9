import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ModulesSection from '@/components/ModulesSection';
import ModulesCatalog from '@/components/ModulesCatalog';

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#f8fcff] to-[#edf8ff]">
          <div className="space-y-8">
            <ModulesSection />
            <ModulesCatalog />
          </div>
        </main>
      </div>
    </div>
  );
}