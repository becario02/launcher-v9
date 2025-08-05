'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import QuickStats from '@/components/admin/menu-tracking/QuickStats';
import DailyActivityChart from '@/components/admin/menu-tracking/charts/DailyActivityChart';
import TopMenusChart from '@/components/admin/menu-tracking/charts/TopMenusChart';
import UserActivityChart from '@/components/admin/menu-tracking/charts/UserActivityChart';
import TrackingTable from '@/components/admin/menu-tracking/TrackingTable';

export default function MenuTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(true);

  // Estados para la tabla de tracking
  const [trackingData, setTrackingData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 15,
    totalItems: 0,
    totalPages: 1
  });

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
    
    // Datos para gráfica de actividad diaria (últimos 7 días)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = allData.filter(item => {
        const itemDate = new Date(item.lastClickDate).toISOString().split('T')[0];
        return itemDate === dateStr;
      }).reduce((sum, item) => sum + item.clickCounter, 0);
      
      dailyData.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        y: dayClicks,
        date: dateStr
      });
    }

    // Datos para top menús más utilizados
    const menuUsage = {};
    allData.forEach(item => {
      const menuName = item.menuName || item.customOptionName || 'Desconocido';
      if (!menuUsage[menuName]) {
        menuUsage[menuName] = 0;
      }
      menuUsage[menuName] += item.clickCounter;
    });

    const topMenusData = Object.entries(menuUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, clicks]) => ({ name, y: clicks }));

    // Datos para actividad por usuario
    const userActivity = {};
    allData.forEach(item => {
      if (!userActivity[item.userName]) {
        userActivity[item.userName] = 0;
      }
      userActivity[item.userName] += item.clickCounter;
    });

    const userActivityData = Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .map(([name, clicks]) => ({ name, y: clicks }));

    return {
      dailyActivity: dailyData,
      topMenus: topMenusData,
      userActivity: userActivityData
    };
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTrackingData();
  }, [page]);

  // Función para cargar datos de tracking
  const fetchTrackingData = async () => {
    setIsLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const allData = generateMockData();
      
      // Paginación directa sin filtros
      const totalItems = allData.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedData = allData.slice(startIndex, startIndex + pageSize);

      setTrackingData(paginatedData);
      setPagination({
        page,
        pageSize,
        totalItems,
        totalPages
      });

    } catch (error) {
      console.error('Error al cargar datos de tracking:', error);
      setToast({
        visible: true,
        message: 'Error al cargar los datos de tracking',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de paginación
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
              <div className="lg:col-span-2">
                <DailyActivityChart 
                  data={generateChartData().dailyActivity}
                  isLoading={isLoading}
                />
              </div>

              <TopMenusChart 
                data={generateChartData().topMenus}
                isLoading={isLoading}
              />

              <UserActivityChart 
                data={generateChartData().userActivity}
                isLoading={isLoading}
              />
            </div>

            {/* Tabla de tracking */}
            <TrackingTable 
              data={trackingData}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={handlePageChange}
              pageSize={pageSize}
            />
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