'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const news = [
  {
    id: 1,
    text: 'Lorem ipsum parturient egestas risus ut elit massa egestas.',
    image:
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    text: 'Lorem ipsum parturient egestas risus ut elit massa egestas.',
    image:
      'https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    text: 'Lorem ipsum parturient egestas risus ut elit massa egestas.',
    image: 'https://source.unsplash.com/featured/?green-energy',
  },
  {
    id: 4,
    text: 'Lorem ipsum parturient egestas risus ut elit massa egestas.',
    image: 'https://source.unsplash.com/featured/?technology',
  },
];

const NewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else {
        setVisibleCount(2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = useMemo(() => {
    return Math.max(0, Math.ceil(news.length / visibleCount) - 1);
  }, [visibleCount]);

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
    <div className="w-full bg-white border border-gray-200 rounded-[8px] p-[20px] shadow-sm relative">
      <div className="flex items-center justify-between mb-[20px] px-[4px]">
        <h2 className="text-[14px] leading-[21px] text-black font-semibold font-[Poppins]">
          Noticias recientes
        </h2>
        <button className="text-[12px] leading-[18px] text-black font-medium font-[Poppins] text-right">
          Ver todo
        </button>
      </div>

      <div className="relative overflow-hidden">
        {/* Flecha izquierda */}
        <button
          onClick={prevSlide}
          className="absolute left-[12px] top-[50%] transform -translate-y-1/2 z-10 
            bg-white rounded-full w-8 h-8 flex items-center justify-center 
            shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Carousel content */}
        <div
          className="flex transition-transform duration-300 ease-in-out justify-center"
          style={{
            width: `${(news.length / visibleCount) * 100}%`,
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {news.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 px-[6px] flex justify-center"
              style={{ width: `${100 / news.length}%` }}
            >
              <div className="border border-gray-200 rounded-[8px] overflow-hidden w-[188px] h-[200px] flex flex-col items-center justify-start pt-[12px]">
                <div className="w-[168px] h-[100px] mb-[8px]">
                  <img
                    src={item.image}
                    alt={item.text}
                    className="w-full h-full object-cover rounded-[6px]"
                  />
                </div>
                <p className="text-[12px] leading-[18px] text-[#171725] text-center font-medium font-[Poppins] px-[12px]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={nextSlide}
          className="absolute right-[12px] top-[50%] transform -translate-y-1/2 z-10 
            bg-white rounded-full w-8 h-8 flex items-center justify-center 
            shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-[12px] space-x-[6px]">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-[8px] h-[8px] rounded-full transition-colors duration-200 
              ${currentIndex === index ? 'bg-gray-800' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsCarousel;
