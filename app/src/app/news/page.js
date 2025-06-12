'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { FileText, Tag } from 'lucide-react';
import Toast from '@/components/Toast';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos integrados de ejemplo
const mockNews = [
  {
    id: 1,
    title: "Nuevas regulaciones de transporte internacional entran en vigor",
    description: "Las nuevas normativas afectarán el transporte de mercancías entre México y Estados Unidos, implementando controles más estrictos.",
    category: "Regulaciones",
    tags: ["Transnacional", "México", "Logística"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    isRead: false
  },
  {
    id: 2,
    title: "Avances tecnológicos en sistemas de rastreo GPS",
    description: "La implementación de nuevos sistemas GPS mejorará la precisión del seguimiento de flotas en tiempo real.",
    category: "Tecnología",
    tags: ["Tecnología", "Advan", "Transporte"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
    isRead: true
  },
  {
    id: 3,
    title: "Expansión de rutas logísticas en el sureste mexicano",
    description: "La empresa amplía su cobertura hacia estados del sureste, ofreciendo nuevas oportunidades de negocio.",
    category: "Expansión",
    tags: ["México", "Logística", "Novedades"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    isRead: false
  },
  {
    id: 4,
    title: "Optimización de procesos en centros de distribución",
    description: "Implementación de nuevas tecnologías para mejorar la eficiencia en el manejo de inventarios.",
    category: "Procesos",
    tags: ["Logística", "Tecnología", "Interesante"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    isRead: true
  },
  {
    id: 5,
    title: "Alianza estratégica con proveedores nucleares",
    description: "Nueva asociación que fortalecerá la cadena de suministro especializada en el sector nuclear.",
    category: "Alianzas",
    tags: ["Nucleares", "Logística", "Advan"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    isRead: false
  },
  {
    id: 6,
    title: "Resultados financieros del tercer trimestre",
    description: "Análisis detallado de los indicadores financieros y proyecciones para el último trimestre del año.",
    category: "Financiero",
    tags: ["Todos", "Financieros", "Interesante"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
    isRead: true
  },
  {
    id: 7,
    title: "Capacitación en seguridad vial para conductores",
    description: "Programa integral de formación para mejorar la seguridad en carretera y reducir accidentes.",
    category: "Capacitación",
    tags: ["Transporte", "México", "Todos"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    isRead: false
  },
  {
    id: 8,
    title: "Sostenibilidad ambiental en operaciones logísticas",
    description: "Iniciativas verdes implementadas para reducir la huella de carbono en todas las operaciones.",
    category: "Sostenibilidad",
    tags: ["Logística", "Novedades", "Todos"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 días atrás
    isRead: true
  },
  {
    id: 9,
    title: "Actualización de sistemas de gestión empresarial",
    description: "Mejoras significativas en las plataformas digitales para optimizar la gestión de recursos.",
    category: "Sistemas",
    tags: ["Tecnología", "Advan", "Interesante"],
    imageUrl: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
    isRead: false
  }
];

// Filtros disponibles
const availableFilters = [
  "Todos",
  "Novedades", 
  "Interesante",
  "Advan",
  "Tecnología",
  "México",
  "Logística",
  "Transnacional",
  "Transporte",
  "Nucleares",
  "Financieros"
];

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  
  const [news, setNews] = useState(mockNews);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(["Todos"]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filtrar noticias basado en los filtros seleccionados
  const filteredNews = news.filter(item => {
    if (selectedFilters.includes("Todos")) return true;
    return selectedFilters.some(filter => item.tags.includes(filter));
  });

  // Manejar selección de filtros
  const handleFilterToggle = (filter) => {
    if (filter === "Todos") {
      setSelectedFilters(["Todos"]);
    } else {
      setSelectedFilters(prev => {
        const newFilters = prev.filter(f => f !== "Todos");
        if (newFilters.includes(filter)) {
          const filtered = newFilters.filter(f => f !== filter);
          return filtered.length === 0 ? ["Todos"] : filtered;
        } else {
          return [...newFilters, filter];
        }
      });
    }
  };

  // Función para formatear la fecha y hora de la noticia
  const formatNewsTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return formatDistance(timestamp, new Date(), {
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return '';
    }
  };

  // Función para obtener el color de la categoría
  const getCategoryColor = (category) => {
    const colors = {
      'Regulaciones': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      'Tecnología': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'Expansión': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      'Procesos': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'Alianzas': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      'Financiero': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      'Capacitación': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      'Sostenibilidad': 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      'Sistemas': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Toast notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="w-full max-w-4xl px-4 md:px-12 lg:px-6 mx-auto md:ml-0 lg:ml-24 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="flex items-center mb-6 pt-4">
              <FileText className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Noticias
              </h1>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-10">
                {/* COLUMNA IZQUIERDA - Filtros */}
                <div className="w-full md:hidden lg:block md:w-60 pt-2">
                  <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea] mb-4">
                    Etiquetas
                  </h3>
                  
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => handleFilterToggle(filter)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                          selectedFilters.includes(filter)
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-[#2C2C38] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3C3C48]"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLUMNA DERECHA - Noticias */}
                <div className="flex-1">
                  {loading ? (
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm">
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-[168px] h-[100px] bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : filteredNews.length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No hay noticias</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          No se encontraron noticias con los filtros seleccionados.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredNews.map((article) => (
                        <div
                          key={article.id}
                          className="border border-gray-200 dark:border-[#2C2C38] rounded-[8px] overflow-hidden w-[188px] h-[200px] flex flex-col items-start justify-start pt-[12px] bg-white dark:bg-[#1C1C24] cursor-pointer hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Imagen */}
                          <div className="w-[168px] h-[100px] mb-[8px] mx-auto bg-gray-100 dark:bg-gray-800 rounded-[6px] flex items-center justify-center">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover rounded-[6px]"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Título */}
                          <p className="text-[12px] leading-[18px] text-[#171725] dark:text-gray-200 text-left font-medium font-[Poppins] px-[12px]">
                            {article.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}