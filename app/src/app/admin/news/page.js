'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import NewsFilters from '@/components/admin/news/NewsFilters';
import NewsGrid from '@/components/admin/news/NewsGrid';
import NewsPagination from '@/components/admin/news/NewsPagination';
import NewsModal from '@/components/admin/news/NewsModal';
import ConfirmModal from '@/components/admin/news/ConfirmModal';
import Notification from '@/components/Notification';
import PermissionsModal from '@/components/admin/news/PermissionsModal';
import { getCategoryColor } from '@/utils/categoryUtils';
import { initialNewsData } from '@/services/newsService';
import { newsService } from '@/services/api/newsService';
import { useTheme } from '@/context/ThemeContext';

export default function AdminNewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
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
  const [notification, setNotification] = useState({ visible: false, type: 'info', message: '', style: 'inline' });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: 'NEWS',
    date: '',
    newsLink: '',
    status: 'ACTIVE',
    imageUrl: '',
    dateExpiration: ''
  });

  // Carga inicial
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const resp = await initialNewsData();
        if (resp?.data?.length) {
          setNews(
            resp.data.map(item => ({
              id: item.idNews,
              title: item.title,
              category: item.newsType,
              status: item.status,
              date: item.creationDate,
              newsLink: item.referenceUrl || '',
              imageUrl: item.imageContent || '',
              dateExpiration: item.expirationDate
            }))
          );
        }
      } catch (e) {
        console.error('Error loading news:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  // Notificaciones
  const showNotification = (type, message, style = 'inline') => {
    setNotification({ visible: false, type: 'info', message: '', style: 'inline' });
    setTimeout(() => setNotification({ visible: true, type, message, style }), 50);
  };
  const closeNotification = () => setNotification(n => ({ ...n, visible: false }));

  // Handlers de modal
  const handleOpenModal = (type, newsItem = null) => {
    setModalType(type);
    setCurrentNews(newsItem);
    if (newsItem) {
      setFormData({
        title: newsItem.title,
        category: newsItem.category,
        date: newsItem.date,
        dateExpiration: newsItem.dateExpiration,
        newsLink: newsItem.newsLink,
        status: newsItem.status,
        imageUrl: newsItem.imageUrl
      });
    } else {
      setFormData({
        title: '',
        category: 'NEWS',
        date: new Date().toISOString().split('T')[0],
        dateExpiration: '',
        newsLink: '',
        status: 'ACTIVE',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Toggle estado activo/inactivo
  const handleConfirmStatusToggle = id => {
    const item = news.find(n => n.id === id);
    if (!item) return;
    setCurrentNews(item);
    setConfirmAction(() => async () => {
      const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      if (newStatus === 'ACTIVE') await newsService.activarNoticia({ idNews: id, status: newStatus });
      else await newsService.desactivarNoticia({ idNews: id, status: newStatus });
      setNews(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
      setIsConfirmModalOpen(false);
      showNotification('success', 'Estado actualizado', 'toast');
    });
    setIsConfirmModalOpen(true);
  };
  const handleCloseConfirmModal = () => setIsConfirmModalOpen(false);

  // Manejo de formulario
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Guardar noticia
  const handleSaveNews = async () => {
    setIsLoading(true);
    try {
      const isoDate = new Date(formData.dateExpiration || formData.date).toISOString();
      const data = {
        newsType: formData.category,
        expirationDate: isoDate,
        title: formData.title,
        referenceUrl: formData.newsLink,
        status: formData.status,
        imageContent: formData.imageUrl
      };
      if (modalType === 'add') await newsService.agregarNoticia(data);
      else if (modalType === 'edit' && currentNews) await newsService.actualizarNoticia({ ...data, idNews: currentNews.id });
      const resp = await initialNewsData();
      setNews(resp.data.map(item => ({
        id: item.idNews,
        title: item.title,
        category: item.newsType,
        status: item.status,
        date: item.creationDate,
        newsLink: item.referenceUrl,
        imageUrl: item.imageContent,
        dateExpiration: item.expirationDate
      })));
      handleCloseModal();
      showNotification('success', `Noticia ${modalType === 'add' ? 'creada' : 'actualizada'} con éxito`, 'toast');
    } catch (e) {
      console.error(e);
      showNotification('error', e.message || 'Error al guardar', 'toast');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtros y paginación
  const filteredNews = isLoading ? [] : news.filter(item => {
    const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirst, indexOfLast);

  const categories = ['all', ...new Set(news.map(n => n.category))];

  // Permisos
  const handleOpenPermissionsModal = id => {
    setCurrentNewsForPermissions(id);
    setIsPermissionsModalOpen(true);
  };
  const handleSavePermissions = (id, perms) => {
    setNewsPermissions(prev => ({ ...prev, [id]: perms }));
    setIsPermissionsModalOpen(false);
    showNotification('success', 'Permisos guardados', 'toast');
  };
  const handleClosePermissionsModal = () => setIsPermissionsModalOpen(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1c1c24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-[#F2F6FD] dark:bg-[#13131a] pt-0">
          <div
            className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6
                       bg-white text-gray-900
                       dark:bg-[#1c1c24] dark:text-white"
          >
            {/* Notificaciones */}
            {notification.visible && notification.style === 'toast' && (
              <div className="fixed top-4 right-4 z-[9999]">
                <Notification
                  visible
                  type={notification.type}
                  message={notification.message}
                  style="toast"
                  onClose={closeNotification}
                />
              </div>
            )}
            {notification.visible && notification.style === 'inline' && (
              <Notification
                visible
                type={notification.type}
                message={notification.message}
                style="inline"
                onClose={closeNotification}
              />
            )}

            {/* Filtros y acciones */}
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

            {/* Grid de noticias */}
            <NewsGrid
              currentItems={currentItems}
              handleOpenModal={handleOpenModal}
              handleConfirmStatusToggle={handleConfirmStatusToggle}
              handleOpenPermissionsModal={handleOpenPermissionsModal}
              getCategoryColor={getCategoryColor}
              isLoading={isLoading}
            />

            {/* Paginación */}
            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirst}
              indexOfLastItem={indexOfLast}
              filteredNewsLength={filteredNews.length}
              prevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
              nextPage={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            />

            {/* Modales */}
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
              initialPermissions={newsPermissions[currentNewsForPermissions]}
              handleCloseModal={handleClosePermissionsModal}
              handleSavePermissions={handleSavePermissions}
            />
          </div>
        </main>
      </div>
    </div>
  );
}