import React, { useState, useEffect } from 'react';
import { X, Bookmark, PlayCircle, FileText, HelpCircle } from 'lucide-react';

// Estilos personalizados para scrollbar
const scrollbarStyles = `
  /* Estilos para navegadores basados en WebKit (Chrome, Safari, Edge moderno) */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
    border: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  /* Para Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }
`;

// Componente para mostrar un video de YouTube
const YouTubeVideoCard = ({ videoUrl, title }) => {
  // Extraer el ID del video de YouTube desde la URL
  const getYouTubeVideoId = (url) => {
    // Maneja diferentes formatos de URL de YouTube
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);
  
  // URLs para miniatura y embed de YouTube
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/api/placeholder/560/315';
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  // Estado para controlar si se está reproduciendo el video
  const [isPlaying, setIsPlaying] = useState(false);
  // Estado para controlar si el iframe está cargando
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayClick = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="relative">
        {isPlaying ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-[1px]">
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 border-2 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={title}
              className="w-full h-40"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            ></iframe>
          </>
        ) : (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={handlePlayClick} 
                className="rounded-full bg-white/80 p-2 hover:bg-white transition-all"
              >
                <PlayCircle size={36} className="text-blue-500" />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-auto">
          {title}
        </p>
        <div className="mt-4 flex justify-end">
          <button className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
            <Bookmark size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const HelpCenterModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('videos');
  
  // Cierra el modal con la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Previene el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Datos de ejemplo para los videos tutoriales con URLs reales de YouTube
  const tutorialVideos = [
    {
      id: 1,
      title: 'Introducción a la plataforma - Primeros pasos',
      url: 'https://www.youtube.com/watch?v=8ocMcgUfFT8',
    },
    {
      id: 2,
      title: 'Cómo usar el panel de administración',
      url: 'https://www.youtube.com/watch?v=8SDBDEpRgYI',
    },
    {
      id: 3,
      title: 'Tutorial de generación de reportes',
      url: 'https://www.youtube.com/watch?v=kg5KflKIzPk',
    },
    {
      id: 4,
      title: 'Configuración de perfiles de usuario',
      url: 'https://www.youtube.com/watch?v=8ocMcgUfFT8',
    },
    {
      id: 5,
      title: 'Optimización de flujos de trabajo',
      url: 'https://www.youtube.com/watch?v=kg5KflKIzPk',
    },
    {
      id: 6,
      title: 'Integración con herramientas externas',
      url: 'https://www.youtube.com/watch?v=8SDBDEpRgYI',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'videos':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="text-blue-500" size={24} />
              <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Video tutoriales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorialVideos.map(video => (
                <YouTubeVideoCard 
                  key={video.id} 
                  videoUrl={video.url} 
                  title={video.title} 
                />
              ))}
            </div>
          </>
        );
      case 'saved':
      case 'faq':
      case 'docs':
      default:
        return (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Esta sección está en desarrollo.
            </p>
          </div>
        );
    }
  };

  // Datos para los elementos del menú con sus respectivos iconos de Lucide
  const menuItems = [
    {
      id: 'saved',
      label: 'Elementos guardados',
      icon: <Bookmark size={18} className="mr-3" />
    },
    {
      id: 'faq',
      label: 'Preguntas frecuentes',
      icon: <HelpCircle size={18} className="mr-3" />
    },
    {
      id: 'videos',
      label: 'Video tutoriales',
      icon: <PlayCircle size={18} className="mr-3" />
    },
    {
      id: 'docs',
      label: 'Documentación',
      icon: <FileText size={18} className="mr-3" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <style>{scrollbarStyles}</style>
      <div className="bg-white dark:bg-[#1c1c24] rounded-lg shadow-lg flex flex-col w-full max-w-6xl h-[85vh] max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-[Poppins] text-[14px] font-medium text-black dark:text-gray-100">Centro de ayuda</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Sidebar and Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Estilo actualizado según la imagen 1 */}
          <div className="w-64 p-4 overflow-y-auto bg-white dark:bg-[#1c1c24] border-r border-gray-200 dark:border-gray-700 custom-scrollbar">
            <nav className="space-y-2">
              {menuItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full py-3 px-4 text-left rounded-md font-[Poppins] text-[12px] font-medium ${
                    activeTab === item.id 
                      ? 'bg-[var(--primary-color)] text-white shadow-sm' 
                      : 'text-[#171725] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;