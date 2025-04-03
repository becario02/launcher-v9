'use client';

import { useState } from 'react';
import NewsHeader from '@/components/admin/news/NewsHeader';
import NewsFilters from '@/components/admin/news/NewsFilters';
import NewsGrid from '@/components/admin/news/NewsGrid';
import NewsPagination from '@/components/admin/news/NewsPagination';
import NewsModal from '@/components/admin/news/NewsModal';
import ConfirmModal from '@/components/admin/news/ConfirmModal';
import { getCategoryColor } from '@/utils/categoryUtils';
import { initialNewsData } from '@/services/newsService';

export default function NewsAdminDashboard() {
  const [news, setNews] = useState(initialNewsData);
  
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
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tecnología',
    date: '',
    content: '',
    status: 'active'
  });
  
  const handleOpenModal = (type, newsItem = null) => {
    setModalType(type);
    setCurrentNews(newsItem);
    
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        category: newsItem.category || 'Tecnología',
        date: newsItem.date || '',
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        status: newsItem.status || 'active'
      });
    } else {
      setFormData({
        title: '',
        category: 'Tecnología',
        date: new Date().toISOString().split('T')[0],
        content: '',
        status: 'active'
      });
    }
    
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNews(null);
    setFormData({
      title: '',
      category: 'Tecnología',
      date: '',
      content: '',
      status: 'active'
    });
  };
  
  const handleConfirmStatusToggle = (id) => {
    const newsItem = news.find(item => item.id === id);
    if (newsItem) {
      setCurrentNews(newsItem);
      setConfirmAction(() => () => {
        setNews(news.map(item => 
          item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item
        ));
        setIsConfirmModalOpen(false);
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value
    });
  };
  
  const handleSaveNews = () => {
    if (modalType === 'add') {
      const newId = Math.max(...news.map(item => item.id)) + 1;
      const newNews = {
        id: newId,
        title: formData.title,
        category: formData.category,
        date: formData.date,
        status: formData.status
      };
      setNews([...news, newNews]);
    } else if (modalType === 'edit' && currentNews) {
      setNews(news.map(item => 
        item.id === currentNews.id ? {
          ...item,
          title: formData.title,
          category: formData.category,
          date: formData.date,
          status: formData.status
        } : item
      ));
    }
    handleCloseModal();
  };
  
  const filteredNews = news.filter(item => {
    const matchesSearch = searchTerm === '' || 
                         item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
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
  
  const categories = ['all', ...new Set(news.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <NewsHeader />
      
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-6 relative z-0">
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
          getCategoryColor={getCategoryColor}
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
    </div>
  );
}