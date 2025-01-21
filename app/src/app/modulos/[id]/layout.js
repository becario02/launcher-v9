import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function ModuleLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-20">
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#f8fcff] to-[#edf8ff]">
          {children}
        </main>
      </div>
    </div>
  );
}