'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { FileText, Tag } from 'lucide-react';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  
  const [news, setNews] = useState([]);
  const [unreadNews, setUnreadNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableFilters, setAvailableFilters] = useState(["Todos"]);
  const [selectedFilters, setSelectedFilters] = useState(["Todos"]);
  const [markingAsRead, setMarkingAsRead] = useState(null);

  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '1'; // Fallback a 1 si no hay cookie

  // Cargar noticias desde la API
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5173/mslauncher/api/v1/news',
        {
          headers: {
            'accept': '*/*'
          }
        }
      );
      
      if (response.data && response.data.data) {
        const newsData = response.data.data;
        setNews(newsData);
        
        // Extraer categorías únicas de newsType y formatearlas
        const categories = [...new Set(newsData.map(item => item.newsType))];
        const formattedFilters = ["Todos", ...categories.map(cat => formatCategoryName(cat))];
        setAvailableFilters(formattedFilters);
      } else {
        setNews([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error al obtener noticias:', error);
      setError('Error al cargar las noticias. Por favor intenta nuevamente.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar noticias no leídas del usuario
  const fetchUnreadNews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5173/mslauncher/api/v1/news/unread?idUser=${userId}`,
        {
          headers: {
            'accept': '*/*'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setUnreadNews(response.data.data);
      } else {
        setUnreadNews([]);
      }
    } catch (error) {
      console.error('Error al obtener noticias no leídas:', error);
      setUnreadNews([]);
    }
  };

  // Marcar noticia como leída
  const markAsRead = async (idNews) => {
    if (markingAsRead === idNews) return; // Prevenir múltiples clics
    
    try {
      setMarkingAsRead(idNews);
      
      const response = await axios.put(
        'http://localhost:5173/mslauncher/api/v1/news/mark-as-read',
        {
          idUser: parseInt(userId),
          idNews: idNews
        },
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.statusCode === "200") {
        // Actualizar la lista de noticias no leídas
        setUnreadNews(prev => prev.filter(news => news.idNews !== idNews));
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Cargar noticias al montar el componente
  useEffect(() => {
    fetchNews();
    fetchUnreadNews();
  }, [userId]);

  // Verificar si una noticia está sin leer
  const isNewsUnread = (idNews) => {
    return unreadNews.some(unread => unread.idNews === idNews);
  };

  // Función auxiliar para obtener el newsType original desde el nombre formateado
  const getOriginalNewsType = (formattedName) => {
    const reverseMapping = {
      'Comunicados': 'COMMUNICATION',
      'Ventana de mantenimiento externas': 'MAINTENANCE_EXTERNAL',
      'General': 'GENERAL_NEWS',
      'Noticias normativas y fiscales': 'LEGAL_NEWS',
      'Blog': 'BLOG',
      'Productos y servicios Advan': 'PRODUCTS_SERVICES',
      'Casos de éxito - Productos o servicios Advan': 'SUCCESS_STORY',
      'Promocional': 'PROMOTIONAL',
      'Nube - Promocional': 'CLOUD_PROMO',
      'Eventos próximos': 'UPCOMING_EVENTS'
    };
    
    return reverseMapping[formattedName] || formattedName;
  };

  // Filtrar noticias basado en los filtros seleccionados
  const filteredNews = news.filter(item => {
    if (selectedFilters.includes("Todos")) return true;
    return selectedFilters.some(filter => {
      const originalNewsType = getOriginalNewsType(filter);
      return item.newsType === originalNewsType;
    });
  });

  // Contar noticias sin leer en las noticias filtradas
  const unreadCount = filteredNews.filter(news => isNewsUnread(news.idNews)).length;

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
      const date = new Date(timestamp);
      return formatDistance(date, new Date(), {
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return '';
    }
  };

  // Función para formatear el nombre de la categoría para mostrar
  const formatCategoryName = (newsType) => {
    const categoryNames = {
      'COMMUNICATION': 'Comunicados',
      'MAINTENANCE_EXTERNAL': 'Ventana de mantenimiento externas',
      'GENERAL_NEWS': 'General',
      'LEGAL_NEWS': 'Noticias normativas y fiscales',
      'BLOG': 'Blog',
      'PRODUCTS_SERVICES': 'Productos y servicios Advan',
      'SUCCESS_STORY': 'Casos de éxito - Productos o servicios Advan',
      'PROMOTIONAL': 'Promocional',
      'CLOUD_PROMO': 'Nube - Promocional',
      'UPCOMING_EVENTS': 'Eventos próximos'
    };
    
    return categoryNames[newsType] || newsType.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para abrir la noticia en una nueva pestaña y marcarla como leída
  const handleNewsClick = (newsItem) => {
    // Marcar como leída si está sin leer
    if (isNewsUnread(newsItem.idNews)) {
      markAsRead(newsItem.idNews);
    }
    
    // Abrir la URL si existe
    if (newsItem.referenceUrl) {
      window.open(newsItem.referenceUrl, '_blank');
    }
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

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="w-full max-w-4xl px-4 md:px-12 lg:px-6 mx-auto md:ml-0 lg:ml-24 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL CON ESTADÍSTICAS */}
            <div className="flex items-center justify-between mb-6 pt-4">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-primary" />
                <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                  Noticias
                </h1>
              </div>
              
              {/* Información estadística */}
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredNews.length} {filteredNews.length === 1 ? 'noticia' : 'noticias'}
                  {!loading && news.length > 0 && (
                    <>
                      {' • '}
                      <span className="text-blue-600 dark:text-blue-400">
                        {unreadCount} sin leer
                      </span>
                    </>
                  )}
                </p>
                {selectedFilters.length > 0 && !selectedFilters.includes("Todos") && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Filtrado por: {selectedFilters.join(', ')}
                  </p>
                )}
              </div>
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
                      {filteredNews.map((article, index) => (
                        <div
                          key={article.idNews}
                          onClick={() => handleNewsClick(article)}
                          className="relative border border-gray-200 dark:border-[#2C2C38] rounded-[8px] overflow-hidden w-[188px] h-[200px] flex flex-col items-start justify-start pt-[12px] bg-white dark:bg-[#1C1C24] cursor-pointer hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Imagen */}
                          <div className="w-[168px] h-[100px] mb-[8px] mx-auto bg-gray-100 dark:bg-gray-800 rounded-[6px] flex items-center justify-center overflow-hidden">
                            {article.imageContent ? (
                              <img
                                src={article.imageContent}
                                alt={article.title}
                                className="w-full h-full object-cover rounded-[6px]"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          
                          {/* Título */}
                          <p className="text-[12px] leading-[18px] text-[#171725] dark:text-gray-200 text-left font-medium font-[Poppins] px-[12px] line-clamp-3">
                            {article.title}
                          </p>

                          {/* Indicador de no leída */}
                          {isNewsUnread(article.idNews) && (
                            <div className="absolute bottom-2 right-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
                            </div>
                          )}
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