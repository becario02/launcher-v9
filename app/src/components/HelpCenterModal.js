import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Bookmark, PlayCircle, FileText, HelpCircle, ExternalLink } from 'lucide-react';

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
const YouTubeVideoCard = ({ videoUrl, title, videoId, favoriteVideos, onToggleFavorite, isTogglingFavorite }) => {
  // Extraer el ID del video de YouTube desde la URL
  const getYouTubeVideoId = (url) => {
    // Maneja diferentes formatos de URL de YouTube
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  
  // URLs para miniatura y embed de YouTube
  const thumbnailUrl = youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg` : '/api/placeholder/560/315';
  const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '';

  // Estado para controlar si se está reproduciendo el video
  const [isPlaying, setIsPlaying] = useState(false);
  // Estado para controlar si el iframe está cargando
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si el video está en favoritos
  const isFavorite = favoriteVideos.some(fav => fav.idVideo === videoId);

  const handlePlayClick = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!isTogglingFavorite) {
      onToggleFavorite(videoId, isFavorite);
    }
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
                <PlayCircle size={36} className="text-[var(--primary-color)]" />
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
          <button 
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`${
              isFavorite 
                ? 'text-[var(--primary-color)]' 
                : 'text-gray-500 hover:text-[var(--primary-color)] dark:text-gray-400 dark:hover:text-[var(--primary-color)]'
            } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTogglingFavorite ? (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-2 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar una tarjeta de video guardado
const SavedVideoCard = ({ video, onRemoveFromFavorites, isRemoving }) => {
  // Extraer el ID del video de YouTube desde la URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = getYouTubeVideoId(video.url);
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

  const handleRemoveFromFavorites = (e) => {
    e.stopPropagation();
    if (!isRemoving) {
      onRemoveFromFavorites(video.idVideo);
    }
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
              title={video.title}
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
              alt={video.title} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={handlePlayClick} 
                className="rounded-full bg-white/80 p-2 hover:bg-white transition-all"
              >
                <PlayCircle size={36} className="text-[var(--primary-color)]" />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-auto">
          {video.title}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Video favorito
          </span>
          <button 
            onClick={handleRemoveFromFavorites}
            disabled={isRemoving}
            className={`text-[var(--primary-color)] hover:text-red-500 dark:text-[var(--primary-color)] dark:hover:text-red-400 ${
              isRemoving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRemoving ? (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-2 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Bookmark size={20} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar una tarjeta de documento guardado
const SavedDocumentCard = ({ document, onRemoveFromFavorites, isRemoving }) => {
  const handleOpenPDF = () => {
    // Crear un blob desde el base64 y abrirlo
    try {
      const byteCharacters = atob(document.file);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      
      // Limpiar la URL del objeto después de un tiempo para liberar memoria
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      // Fallback: intentar abrir directamente si hay una URL
      if (document.pdfUrl) {
        window.open(document.pdfUrl, '_blank');
      }
    }
  };

  const handleRemoveFromFavorites = (e) => {
    e.stopPropagation();
    if (!isRemoving) {
      onRemoveFromFavorites(document.idDocument);
    }
  };

  return (
    <div 
      className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={handleOpenPDF}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <FileText size={20} className="text-[var(--primary-color)] mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                {document.name || document.title}
              </h3>
              <div className="flex items-center gap-2">
                {document.category && (
                  <span className="text-xs text-[var(--primary-color)] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    {document.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {document.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Documento favorito
          </span>
          <button 
            onClick={handleRemoveFromFavorites}
            disabled={isRemoving}
            className={`text-[var(--primary-color)] hover:text-red-500 dark:text-[var(--primary-color)] dark:hover:text-red-400 ${
              isRemoving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRemoving ? (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-2 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Bookmark size={20} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ document, favoriteDocuments, onToggleFavorite, isTogglingFavorite }) => {
  // Verificar si el documento está en favoritos
  const isFavorite = favoriteDocuments && favoriteDocuments.some(fav => fav.idDocument === document.idDocument);

  const handleOpenPDF = () => {
    // Crear un blob desde el base64 y abrirlo
    try {
      const byteCharacters = atob(document.file);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      
      // Limpiar la URL del objeto después de un tiempo para liberar memoria
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      // Fallback: intentar abrir directamente si hay una URL
      if (document.pdfUrl) {
        window.open(document.pdfUrl, '_blank');
      }
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!isTogglingFavorite && onToggleFavorite) {
      onToggleFavorite(document.idDocument, isFavorite);
    }
  };

  return (
    <div 
      className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={handleOpenPDF}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <FileText size={20} className="text-[var(--primary-color)] mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                {document.name || document.title}
              </h3>
              {document.category && (
                <span className="text-xs text-[var(--primary-color)] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  {document.category}
                </span>
              )}
            </div>
          </div>
          <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {document.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Subido: {new Date(document.uploadDate || document.lastUpdated).toLocaleDateString('es-ES')}
          </span>
          <button 
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`${
              isFavorite 
                ? 'text-[var(--primary-color)]' 
                : 'text-gray-500 hover:text-[var(--primary-color)] dark:text-gray-400 dark:hover:text-[var(--primary-color)]'
            } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTogglingFavorite ? (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-2 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const HelpCenterModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [favoriteVideos, setFavoriteVideos] = useState([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingFavoriteDocuments, setIsLoadingFavoriteDocuments] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingDocumentFavorite, setIsTogglingDocumentFavorite] = useState(false);
  const [removingVideoId, setRemovingVideoId] = useState(null);
  const [removingDocumentId, setRemovingDocumentId] = useState(null);
  const [error, setError] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  
  // ID del usuario (en una aplicación real, esto vendría del contexto de autenticación)
  const userId = 1;
  
  // Función para obtener videos activos de la API
  const fetchActiveVideos = async () => {
    setIsLoadingVideos(true);
    setError(null);
    try {
      const response = await axios.get('/api/videos', {
        params: {
          status: 'ACTIVE',
          page: 1,
          pageSize: 100
        }
      });
      
      const responseData = response.data;
      setVideos(responseData.data || []);
    } catch (err) {
      console.error('Error al cargar videos:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Función para obtener documentos activos de la API
  const fetchActiveDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError(null);
    try {
      const response = await axios.get('/api/documents');
      
      const responseData = response.data;
      setDocuments(responseData.data || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setDocumentsError('No se pudieron cargar los documentos.');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Función para obtener videos favoritos
  const fetchFavoriteVideos = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await axios.get('/api/videos/favorites', {
        params: {
          idUser: userId
        }
      });
      
      const responseData = response.data;
      setFavoriteVideos(responseData.data || []);
    } catch (err) {
      console.error('Error al cargar videos favoritos:', err);
      // No mostramos error aquí para no interrumpir la experiencia del usuario
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Función para obtener documentos favoritos
  const fetchFavoriteDocuments = async () => {
    setIsLoadingFavoriteDocuments(true);
    try {
      const response = await axios.get('/api/documents/favorites', {
        params: {
          idUser: userId
        }
      });
      
      const responseData = response.data;
      setFavoriteDocuments(responseData.data || []);
    } catch (err) {
      console.error('Error al cargar documentos favoritos:', err);
      // No mostramos error aquí para no interrumpir la experiencia del usuario
    } finally {
      setIsLoadingFavoriteDocuments(false);
    }
  };

  // Función para agregar documento a favoritos
  const addDocumentToFavorites = async (documentId) => {
    try {
      const response = await axios.post('/api/documents/favorites', {
        idUser: userId,
        idDocument: documentId
      });

      // Actualizar la lista de favoritos
      await fetchFavoriteDocuments();
      return true;
    } catch (err) {
      console.error('Error al agregar documento a favoritos:', err);
      return false;
    }
  };

  // Función para quitar documento de favoritos
  const removeDocumentFromFavorites = async (documentId) => {
    try {
      const response = await axios.delete('/api/documents/favorites', {
        data: {
          idUser: userId,
          idDocument: documentId
        }
      });

      // Actualizar la lista de favoritos
      await fetchFavoriteDocuments();
      return true;
    } catch (err) {
      console.error('Error al quitar documento de favoritos:', err);
      return false;
    }
  };

  // Función para alternar estado de favorito de documento
  const handleToggleDocumentFavorite = async (documentId, isFavorite) => {
    setIsTogglingDocumentFavorite(true);
    
    try {
      if (isFavorite) {
        await removeDocumentFromFavorites(documentId);
      } else {
        await addDocumentToFavorites(documentId);
      }
    } catch (err) {
      console.error('Error al cambiar estado de favorito del documento:', err);
    } finally {
      setIsTogglingDocumentFavorite(false);
    }
  };

  // Función para quitar documento de la lista de favoritos (para la sección guardados)
  const handleRemoveDocumentFromFavorites = async (documentId) => {
    setRemovingDocumentId(documentId);
    
    try {
      await removeDocumentFromFavorites(documentId);
    } catch (err) {
      console.error('Error al quitar documento de favoritos:', err);
    } finally {
      setRemovingDocumentId(null);
    }
  };

  // Función para agregar video a favoritos
  const addToFavorites = async (videoId) => {
    try {
      const response = await axios.post('/api/videos/favorites', {
        idUser: userId,
        idVideo: videoId
      });

      // Actualizar la lista de favoritos
      await fetchFavoriteVideos();
      return true;
    } catch (err) {
      console.error('Error al agregar a favoritos:', err);
      return false;
    }
  };

  // Función para quitar video de favoritos
  const removeFromFavorites = async (videoId) => {
    try {
      const response = await axios.delete('/api/videos/favorites', {
        params: {
          idUser: userId,
          idVideo: videoId
        }
      });

      // Actualizar la lista de favoritos
      await fetchFavoriteVideos();
      return true;
    } catch (err) {
      console.error('Error al quitar de favoritos:', err);
      return false;
    }
  };

  // Función para alternar estado de favorito
  const handleToggleFavorite = async (videoId, isFavorite) => {
    setIsTogglingFavorite(true);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(videoId);
      } else {
        await addToFavorites(videoId);
      }
    } catch (err) {
      console.error('Error al cambiar estado de favorito:', err);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Función para quitar video de la lista de favoritos (para la sección guardados)
  const handleRemoveFromFavorites = async (videoId) => {
    setRemovingVideoId(videoId);
    
    try {
      await removeFromFavorites(videoId);
    } catch (err) {
      console.error('Error al quitar de favoritos:', err);
    } finally {
      setRemovingVideoId(null);
    }
  };

  // Cargar videos cuando el modal se abre
  useEffect(() => {
    if (isOpen && activeTab === 'videos') {
      fetchActiveVideos();
      fetchFavoriteVideos();
    }
  }, [isOpen, activeTab]);

  // Cargar documentos cuando se cambia a la pestaña de documentos
  useEffect(() => {
    if (isOpen && activeTab === 'docs') {
      fetchActiveDocuments();
      fetchFavoriteDocuments();
    }
  }, [isOpen, activeTab]);

  // Cargar favoritos cuando se cambia a la pestaña de guardados
  useEffect(() => {
    if (isOpen && activeTab === 'saved') {
      fetchFavoriteVideos();
      fetchFavoriteDocuments();
    }
  }, [isOpen, activeTab]);
  
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'videos':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="text-[var(--primary-color)]" size={24} />
              <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Video tutoriales</h2>
            </div>
            
            {isLoadingVideos ? (
              // Estado de carga
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Estado de error
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p className="mb-4">{error}</p>
                <button 
                  onClick={fetchActiveVideos}
                  className="text-[var(--primary-color)] hover:text-[var(--primary-color)]"
                >
                  Reintentar
                </button>
              </div>
            ) : videos.length === 0 ? (
              // Estado sin videos
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No hay videos tutoriales disponibles.
                </p>
              </div>
            ) : (
              // Estado con videos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <YouTubeVideoCard 
                    key={video.idVideo} 
                    videoUrl={video.url} 
                    title={video.title}
                    videoId={video.idVideo}
                    favoriteVideos={favoriteVideos}
                    onToggleFavorite={handleToggleFavorite}
                    isTogglingFavorite={isTogglingFavorite}
                  />
                ))}
              </div>
            )}
          </>
        );
      case 'docs':
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-[var(--primary-color)]" size={24} />
              <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Documentación</h2>
            </div>
            
            {isLoadingDocuments ? (
              // Estado de carga
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center flex-1">
                          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documentsError ? (
              // Estado de error
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p className="mb-4">{documentsError}</p>
                <button 
                  onClick={fetchActiveDocuments}
                  className="text-[var(--primary-color)] hover:text-[var(--primary-color)]"
                >
                  Reintentar
                </button>
              </div>
            ) : documents.length === 0 ? (
              // Estado sin documentos
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No hay documentos disponibles.
                </p>
              </div>
            ) : (
              // Estado con documentos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map(document => (
                  <DocumentCard 
                    key={document.idDocument} 
                    document={document}
                    favoriteDocuments={favoriteDocuments}
                    onToggleFavorite={handleToggleDocumentFavorite}
                    isTogglingFavorite={isTogglingDocumentFavorite}
                  />
                ))}
              </div>
            )}
          </>
        );
      case 'saved':
        const isLoadingSavedContent = isLoadingFavorites || isLoadingFavoriteDocuments;
        const hasContent = favoriteVideos.length > 0 || favoriteDocuments.length > 0;
        
        return (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Bookmark className="text-[var(--primary-color)]" size={24} />
              <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Elementos guardados</h2>
            </div>
            
            {isLoadingSavedContent ? (
              // Estado de carga
              <div className="space-y-8">
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !hasContent ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No tienes elementos guardados aún.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Videos guardados */}
                {favoriteVideos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                      Videos favoritos ({favoriteVideos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteVideos.map(video => (
                        <SavedVideoCard 
                          key={video.idVideo} 
                          video={video}
                          onRemoveFromFavorites={handleRemoveFromFavorites}
                          isRemoving={removingVideoId === video.idVideo}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Documentos guardados */}
                {favoriteDocuments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">
                      Documentos favoritos ({favoriteDocuments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteDocuments.map(document => (
                        <SavedDocumentCard 
                          key={document.idDocument} 
                          document={document}
                          onRemoveFromFavorites={handleRemoveDocumentFromFavorites}
                          isRemoving={removingDocumentId === document.idDocument}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        );
      case 'faq':
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