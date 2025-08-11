'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import QuickStats from '@/components/admin/menu-tracking/QuickStats';
import TopMenusChart from '@/components/admin/menu-tracking/charts/TopMenusChart';
import CompanyActivityChart from '@/components/admin/menu-tracking/charts/CompanyActivityChart';

export default function MenuTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);

  // Estado para notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Datos ficticios para el tracking
  const generateMockData = () => {
    const mockData = [];
    const users = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
    const companies = [
      'Empresa A S.A.', 'Corporación B', 'Industrias C', 'Grupo D', 'Compañía E Ltd.',
      'Tecnología F Inc.', 'Servicios G Corp.', 'Manufactura H', 'Comercial I S.A.', 'Construcción J',
      'Logística K Ltd.', 'Consultora L', 'Financiera M', 'Retail N S.A.', 'Energía O Corp.'
    ];
    const menus = [
      'Dashboard Principal', 'Reportes Financieros', 'Gestión Usuarios', 'Configuraciones',
      'Módulo Ventas', 'Inventario', 'Contabilidad', 'Recursos Humanos', 'CRM'
    ];
    const customOptions = [
      'Facturación Electrónica', 'Reportes Avanzados', 'Integración API', 'Backup Automático',
      'Análisis de Datos', 'Dashboard Ejecutivo', 'Gestión Documental'
    ];

    for (let i = 1; i <= 150; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      const hasCustomOption = Math.random() > 0.6; // 40% probabilidad de tener custom option
      
      mockData.push({
        idMenuTracking: i,
        idUser: Math.floor(Math.random() * 5) + 1,
        userName: users[Math.floor(Math.random() * users.length)],
        companyName: companies[Math.floor(Math.random() * companies.length)],
        idCustomOption: hasCustomOption ? Math.floor(Math.random() * customOptions.length) + 1 : 0,
        customOptionName: hasCustomOption ? customOptions[Math.floor(Math.random() * customOptions.length)] : null,
        idMenu: hasCustomOption ? 0 : Math.floor(Math.random() * menus.length) + 1,
        menuName: hasCustomOption ? null : menus[Math.floor(Math.random() * menus.length)],
        lastClickDate: date.toISOString(),
        ipName: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        clickCounter: Math.floor(Math.random() * 50) + 1
      });
    }

    return mockData.sort((a, b) => new Date(b.lastClickDate) - new Date(a.lastClickDate));
  };

  // Generar datos para las gráficas
  const generateChartData = () => {
    const allData = generateMockData();

    return {
      allData: allData, // Pasar todos los datos para que cada componente los procese
      companyActivity: allData // Mantener compatibilidad con CompanyActivityChart
    };
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Cerrar toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex font-poppins">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden md:block fixed z-10 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 w-full md:pl-60">
        {/* Navbar */}
        <Navbar className="sticky top-0 z-30" onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Menu Tracking
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Monitorea el acceso y uso de los menús por parte de los usuarios.
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <QuickStats isLoading={isLoading} />

            {/* Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMenusChart 
                data={generateChartData().allData}
                isLoading={isLoading}
              />

              <CompanyActivityChart 
                data={generateChartData().companyActivity}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>

        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}
      </div>
    </div>
  );
}