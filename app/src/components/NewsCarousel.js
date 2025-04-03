'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const news = [
  {
    id: 1,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 2,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 3,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 4,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 5,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 6,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
  {
    id: 7,
    title: 'Lorem ipsum duis scelerisque',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
  },
];

const NewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = useMemo(() => {
    return Math.max(0, Math.ceil(news.length / visibleCount) - 1);
  }, [visibleCount]);

  // Ensure currentIndex doesn't go out of bounds when visibleCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const translateX = (100 / (news.length / visibleCount)) * currentIndex;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-medium text-gray-900">Noticias recientes</h2>
        <button className="text-sm text-gray-500 hover:text-gray-700">Ver todo</button>
      </div>

      <div className="relative overflow-hidden">
        {/* Left Nav */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
            bg-white rounded-full w-8 h-8 flex items-center justify-center 
            shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Carousel Items */}
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            width: `${(news.length / visibleCount) * 100}%`,
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {news.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{
                width: `${100 / news.length}%`,
                padding: '0 0.25rem',
              }}
            >
              <div className="border border-gray-200 rounded cursor-pointer">
                <div className="p-2">
                  <div className="bg-gray-200 h-28 w-full rounded mb-2"></div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-xs font-medium text-gray-800 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Nav */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
            bg-white rounded-full w-8 h-8 flex items-center justify-center 
            shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-2 space-x-1.5">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 
              ${currentIndex === index ? 'bg-gray-800' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCarousel;
