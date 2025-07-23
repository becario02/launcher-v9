'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';

const NewsCarousel = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://advan-gateway-51wn5q29.uc.gateway.dev';
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  const idUser = Cookies.get('idUser');

  // Configuración del auto-play (en milisegundos)
  const AUTO_PLAY_INTERVAL = 4000; // 4 segundos

  useEffect(() => {
    const fetchUnreadNews = async () => {
      if (!idUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/news?idUser=${idUser}`, {
          headers: {
            'Accept-Language': 'es-MX'
          }
        });

        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        if (data?.data) {
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error al obtener noticias no leídas:', error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadNews();
  }, [idUser]);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(window.innerWidth < 640 ? 1 : 2);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = useMemo(() => {
    return Math.max(0, Math.ceil(news.length / visibleCount) - 1);
  }, [news.length, visibleCount]);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex]);

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying && news.length > visibleCount && !isLoading) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, AUTO_PLAY_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, news.length, visibleCount, maxIndex, isLoading]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    // Pausar auto-play temporalmente cuando el usuario interactúa
    pauseAutoPlay();
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    // Pausar auto-play temporalmente cuando el usuario interactúa
    pauseAutoPlay();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Pausar auto-play temporalmente cuando el usuario interactúa
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    // Reanudar auto-play después de 10 segundos de inactividad
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const translateX = (100 / (news.length / visibleCount)) * currentIndex;

  const markAsRead = async (idNews, url) => {
    try {
      await fetch('/api/news', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'es-MX'
        },
        body: JSON.stringify({
          IdUser: parseInt(idUser),
          IdNews: idNews
        })
      });

      if (url) {
        window.open(url, '_blank');
      }

      setNews((prev) => prev.filter((n) => n.idNews !== idNews));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  return (
    <div 
      className="w-full h-[300px] bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-[8px] p-[20px] shadow-sm relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-[20px] px-[4px]">
        <h2 className="text-[14px] leading-[21px] text-black dark:text-gray-200 font-semibold font-[Poppins]">
          Noticias recientes
        </h2>
        <Link href="/news">
          <button className="text-[12px] leading-[18px] text-black dark:text-gray-200 font-medium font-[Poppins] text-right hover:underline">
            Ver todo
          </button>
        </Link>
      </div>

      {isLoading ? (
        // Skeleton loading state 
        <div className="flex justify-center gap-[12px]">
          {Array(visibleCount).fill(0).map((_, index) => (
            <div key={index} className="w-[188px] h-[200px] border border-gray-200 dark:border-[#2C2C38] rounded-[8px] overflow-hidden bg-white dark:bg-[#1C1C24] p-[12px]">
              {/* Skeleton para imagen */}
              <div className="w-[168px] h-[100px] bg-gray-200 dark:bg-gray-700 rounded-[6px] mb-[8px] mx-auto animate-pulse"></div>
              {/* Skeleton para título */}
              <div className="px-[0px]">
                <div className="h-[18px] bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-[18px] bg-gray-100 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ height: 'calc(100% - 60px)' }}>
          <Newspaper size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-[16px] md:text-[14px] text-gray-500 dark:text-gray-400 font-medium font-[Poppins]">
            No tienes noticias sin leer
          </p>
          <p className="text-[14px] md:text-[12px] text-gray-400 dark:text-gray-500 mt-2 font-[Poppins]">
            Las nuevas noticias aparecerán en este carrusel
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* Flecha izquierda */}
          <button
            onClick={prevSlide}
            className="absolute left-[12px] top-[50%] transform -translate-y-1/2 z-10 
              bg-white dark:bg-[#2C2C38] rounded-full w-8 h-8 flex items-center justify-center 
              shadow-md hover:bg-gray-50 dark:hover:bg-[#333] transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Carrusel */}
          <div
            className="flex transition-transform duration-300 ease-in-out justify-center"
            style={{
              width: `${(news.length / visibleCount) * 100}%`,
              transform: `translateX(-${translateX}%)`,
            }}
          >
            {news.map((item) => (
              <div
                key={item.idNews}
                onClick={() => markAsRead(item.idNews, item.referenceUrl)}
                className="flex-shrink-0 px-[6px] flex justify-center cursor-pointer"
                style={{ width: `${100 / news.length}%` }}
              >
                <div className="border border-gray-200 dark:border-[#2C2C38] rounded-[8px] overflow-hidden w-[188px] h-[200px] flex flex-col items-start justify-start pt-[12px] bg-white dark:bg-[#1C1C24] hover:shadow-md transition-shadow duration-200">
                  <div className="w-[168px] h-[100px] mb-[8px] mx-auto">
                    <img
                      src={item.imageContent || '/default-news.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-[6px]"
                    />
                  </div>
                  <p className="text-[12px] leading-[18px] text-[#171725] dark:text-gray-200 text-left font-medium font-[Poppins] px-[12px]">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Flecha derecha */}
          <button
            onClick={nextSlide}
            className="absolute right-[12px] top-[50%] transform -translate-y-1/2 z-10 
              bg-white dark:bg-[#2C2C38] rounded-full w-8 h-8 flex items-center justify-center 
              shadow-md hover:bg-gray-50 dark:hover:bg-[#333] transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Paginación */}
      {news.length > visibleCount && (
        <div className="flex justify-center mt-[12px] space-x-[6px]">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-[8px] h-[8px] rounded-full transition-colors duration-200 hover:scale-110 transform
                ${currentIndex === index ? 'bg-gray-800 dark:bg-gray-100' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCarousel;