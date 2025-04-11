'use client';

import { useState, useEffect } from 'react';
import NewsHeader from '@/components/admin/news/NewsHeader';
import NewsFilters from '@/components/admin/news/NewsFilters';
import NewsGrid from '@/components/admin/news/NewsGrid';
import NewsPagination from '@/components/admin/news/NewsPagination';
import NewsModal from '@/components/admin/news/NewsModal';
import ConfirmModal from '@/components/admin/news/ConfirmModal';
import Notification from '@/components/admin/news/Notification';
import PermissionsModal from '@/components/admin/news/PermissionsModal';
import { getCategoryColor } from '@/utils/categoryUtils';
import { initialNewsData } from '@/services/newsService';
import { newsService } from '@/services/api/newsService';

export default function NewsAdminDashboard() {
  const [news, setNews] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentNews, setCurrentNews] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [currentNewsForPermissions, setCurrentNewsForPermissions] = useState(null);
  const [newsPermissions, setNewsPermissions] = useState({});
  
  const [notification, setNotification] = useState({ 
    visible: false, 
    type: 'info', 
    message: '', 
    style: 'inline'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'NEWS', // Usa 'NEWS' en lugar de 'Tecnología'
    date: '',
    newsLink: '',
    status: 'ACTIVE', // En mayúsculas
    imageUrl: '',
    dateExpiration: ''
  });


  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const response = await initialNewsData();
        
        if (response && response.data && Array.isArray(response.data)) {
          const transformedData = response.data.map(item => ({
            id: item.idNews,
            title: item.title,
            category: item.newsType,
            status: item.status,
            date: item.creationDate,
            newsLink: item.referenceUrl || '',
            imageUrl: item.imageContent || '',
            dateExpiration: item.expirationDate
          }));
          
          setNews(transformedData);
        } else {
          console.warn("No se pudieron obtener datos válidos:", response);
          setNews([]);
        }
      } catch (error) {
        console.error("Error al cargar noticias:", error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNews();
  }, []);
  
  
  const showNotification = (type, message, style = 'inline') => {
    setNotification({
      visible: false,
      type: 'info',
      message: '',
      style: 'inline'
    });
    
    setTimeout(() => {
      setNotification({
        visible: true,
        type,
        message,
        style
      });
      
      if (style === 'toast') {
        setTimeout(() => {
          setNotification(prev => ({ ...prev, visible: false }));
        }, 4000);
      }
    }, 50);
  };
  
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };
  
  const handleOpenModal = (type, newsItem = null) => {
    setModalType(type);
    setCurrentNews(newsItem);
    
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        category: mapCategoryToEnum(newsItem.category),
        date: newsItem.date || '',
        dateExpiration: newsItem.dateExpiration || '', // Asignar la fecha de expiración correctamente
        newsLink: newsItem.newsLink || '',
        status: newsItem.status ? newsItem.status.toUpperCase() : 'ACTIVE',
        imageUrl: newsItem.imageUrl || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'NEWS',
        date: new Date().toISOString().split('T')[0],
        dateExpiration: '', // Inicializar también para nuevos items
        newsLink: '',
        status: 'ACTIVE',
        imageUrl: ''
      });
    }
    
    setIsModalOpen(true);
  };

  const mapCategoryToEnum = (category) => {
    // Mapea las categorías antiguas a los nuevos valores de enum
    const categoryMap = {
      'Tecnología': 'NEWS',
      'NOTIFICATION': 'NOTIFICATION',
      'Mantenimiento': 'ADVICE',
      'Características': 'NEWS',
      'Eventos': 'NEWS'
    };
    
    return categoryMap[category] || 'NEWS'; // Por defecto, usa 'NEWS' si no hay coincidencia
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNews(null);
    setFormData({
      title: '',
      category: 'NEWS',
      date: '',
      newsLink: '',
      status: 'ACTIVE',
      imageUrl: ''
    });
  };
  
  const handleConfirmStatusToggle = async (id) => {
    const newsItem = news.find(item => item.id === id);
    if (newsItem) {
        setCurrentNews(newsItem);
        setConfirmAction(() => async () => {
            // Verificar usando mayúsculas como en el resto de la aplicación
            const newStatus = newsItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            
            const data = { 
                idNews: id,
                status: newStatus
            };
            
            if (newStatus === 'ACTIVE') {
                await newsService.activarNoticia(data);
            } else {
                await newsService.desactivarNoticia(data);
            }
            
            setNews(news.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
            
            setIsConfirmModalOpen(false);
            showNotification('success', 'Estado de la noticia actualizado correctamente', 'toast');
        });
        setIsConfirmModalOpen(true);
    }
  };
  
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'date') {
      setFormData({
        ...formData,
        dateExpiration: value,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value
      });
    }
  };
  
  const handleSaveNews = async () => {
    try {
      if (!formData.title || !formData.category) {
        showNotification('error', 'Por favor completa todos los campos obligatorios');
        return;
      }
  
      if (!formData.newsLink) {
        showNotification('error', 'Por favor ingresa el enlace de la noticia');
        return;
      }
  
      const dateValue = formData.dateExpiration || formData.date;
      
      if (!dateValue) {
        showNotification('error', 'Por favor selecciona una fecha de expiración');
        return;
      }
  
      let isoDate;
try {
  const dateValue = formData.dateExpiration || formData.date;
  console.log('Valor de fecha original:', dateValue);
  
  let normalizedDate;
  
  // Formato simple YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    normalizedDate = `${dateValue}T00:00:00.000Z`;
  } 
  // Formato con T pero sin Z
  else if (dateValue.includes('T') && !dateValue.includes('Z')) {
    normalizedDate = `${dateValue}.000Z`;
  }
  // Ya incluye T y Z
  else if (dateValue.includes('T') && dateValue.includes('Z')) {
    normalizedDate = dateValue;
  } 
  else {
    throw new Error('Formato de fecha no reconocido');
  }
  
  // Crear objeto Date y verificar validez
  const dateObj = new Date(normalizedDate);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Fecha inválida después de normalización');
  }
  
  isoDate = dateObj.toISOString();
  console.log('Fecha normalizada:', normalizedDate);
  console.log('Fecha ISO final:', isoDate);
} catch (error) {
  console.error('Error al procesar fecha:', error);
  showNotification('error', 'Formato de fecha inválido');
  return;
}
  
      const newsData = {
        newsType: formData.category,
        expirationDate: isoDate,
        title: formData.title,
        referenceUrl: formData.newsLink || '',
        status: 'ACTIVE',
        imageContent: formData.imageUrl ? formData.imageUrl.substring(0, 100000) : null
      };

      setIsLoading(true);
      
      let response;
      
      if (modalType === 'add') {
        try {
          console.log('Adding news:', newsData);
          setIsLoading(true);
          
          // 1. Primero agregamos la noticia y esperamos que termine
          await newsService.agregarNoticia(newsData);
          
          // 2. Después recargamos todos los datos
          const response = await initialNewsData();
          
          if (response && response.data && Array.isArray(response.data)) {
            const transformedData = response.data.map(item => ({
              id: item.idNews,
              title: item.title,
              category: item.newsType,
              status: item.status,
              date: item.creationDate,
              newsLink: item.referenceUrl || '',
              imageUrl: item.imageContent || '',
            }));
            
            // 3. Actualizamos el estado con los datos actualizados
            setNews(transformedData);
            
            // 4. Solo entonces cerramos el modal y mostramos la notificación
            handleCloseModal();
            showNotification('success', 'Noticia creada exitosamente', 'toast');
          }
        } catch (error) {
          console.error('Error al crear la noticia:', error);
          
          let errorMessage = 'Error al crear la noticia';
          try {
            if (error.json && typeof error.json === 'function') {
              const errorData = await error.json();
              errorMessage = errorData.message || errorMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
          } catch (e) {

          }
          
          showNotification('error', errorMessage, 'toast');
        }

      } else if (modalType === 'edit' && currentNews) {
        try {
              // Preparar los datos correctamente para la actualización
          const data = {
            ...newsData,
            idNews: currentNews.id,  // Usar idNews en lugar de id
            // Asegurar que la imagen se envía correctamente
            imageContent: formData.imageUrl ? formData.imageUrl.substring(0, 100000) : null
          };
          
          delete data.id;
          
          const updatedNews = await newsService.actualizarNoticia(data);
          
          setNews(prevNews => prevNews.map(item => 
            item.id === currentNews.id ? {
              ...item,
              title: data.title,
              category: data.newsType,
              status: data.status,
              newsLink: data.referenceUrl || '',
              imageUrl: data.imageContent || item.imageUrl,
              dateExpiration: data.expirationDate
            } : item
          ));
          
          handleCloseModal();
          showNotification('success', 'Noticia actualizada exitosamente', 'toast');
        } catch (error) {
          console.error('Error al actualizar la noticia:', error);
          let errorMessage = 'Error al actualizar la noticia';
          try {
            if (error.json && typeof error.json === 'function') {
              const errorData = await error.json();
              errorMessage = errorData.message || errorMessage;
            } else if (error.message) {
              errorMessage = error.message;
            }
          } catch (e) {

          }
          showNotification('error', errorMessage, 'toast');
        }
      }
      
    } catch (error) {
      console.error('Error al guardar la noticia:', error);
      showNotification('error', error.message || 'Ha ocurrido un error al guardar la noticia');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredNews = isLoading 
  ? [] 
  : (Array.isArray(news) 
      ? news.filter(item => {
          const matchesSearch = searchTerm === '' || 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
          const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
          return matchesSearch && matchesStatus && matchesCategory; // Usa && en lugar de comas
        })
      : []);
  
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const categories = ['all', ...new Set(Array.isArray(news) 
    ? news.map(item => item.category)
    : [])];
  
    const handleOpenPermissionsModal = (newsId) => {
      setCurrentNewsForPermissions(newsId);
      
      // Aquí podrías cargar los permisos actuales de la noticia desde el backend
      // Por ahora, usamos un objeto vacío o los permisos guardados previamente
      setNewsPermissions(prevPermissions => ({
        ...prevPermissions,
        [newsId]: prevPermissions[newsId] || {
          applications: [],
          clients: [],
          users: []
        }
      }));
      
      setIsPermissionsModalOpen(true);
    };
    
    // Añadir esta función para cerrar el modal de permisos
    const handleClosePermissionsModal = () => {
      setIsPermissionsModalOpen(false);
      setCurrentNewsForPermissions(null);
    };
    
    const handleSavePermissions = async (newsId, permissions) => {
      try {
        setIsLoading(true);
        
        // Ya no es necesario llamar a la API aquí, ya se hizo dentro del modal
        // Solo actualizamos el estado local
        setNewsPermissions(prevPermissions => ({
          ...prevPermissions,
          [newsId]: permissions
        }));
        
        setIsPermissionsModalOpen(false);
        showNotification('success', 'Permisos actualizados correctamente', 'toast');
      } catch (error) {
        console.error('Error al guardar permisos:', error);
        showNotification('error', 'Error al guardar los permisos', 'toast');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative">
        <NewsHeader />
        
        {notification.visible && notification.style === 'toast' && (
          <div className="fixed top-4 right-4 z-[9999] w-auto">
            <Notification 
              visible={true}
              type={notification.type}
              message={notification.message}
              style="toast"
              onClose={closeNotification}
            />
          </div>
        )}
        
        {/* Cambiar esta línea */}
        <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-6 relative">
          {notification.visible && notification.style === 'inline' && (
            <div className="relative z-[9999]">
              <Notification 
                visible={true}
                type={notification.type}
                message={notification.message}
                style="inline"
                onClose={closeNotification}
              />
            </div>
          )}
          
          <NewsFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            handleOpenModal={handleOpenModal}
            setCurrentPage={setCurrentPage}
          />
          
          <NewsGrid 
            currentItems={currentItems}
            handleOpenModal={handleOpenModal}
            handleConfirmStatusToggle={handleConfirmStatusToggle}
            handleOpenPermissionsModal={handleOpenPermissionsModal} // Pasar la función
            getCategoryColor={getCategoryColor}
            isLoading={isLoading}
          />
          
          <NewsPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            filteredNewsLength={filteredNews.length}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </main>
        
        <NewsModal 
          isOpen={isModalOpen}
          modalType={modalType}
          formData={formData}
          handleFormChange={handleFormChange}
          handleCloseModal={handleCloseModal}
          handleSaveNews={handleSaveNews}
        />
        
        <ConfirmModal 
          isOpen={isConfirmModalOpen}
          currentNews={currentNews}
          confirmAction={confirmAction}
          handleCloseConfirmModal={handleCloseConfirmModal}
        />

        <PermissionsModal
          isOpen={isPermissionsModalOpen}
          newsId={currentNewsForPermissions}
          initialPermissions={currentNewsForPermissions ? newsPermissions[currentNewsForPermissions] : null}
          handleCloseModal={handleClosePermissionsModal}
          handleSavePermissions={handleSavePermissions}
        />
      </div>
    );
}