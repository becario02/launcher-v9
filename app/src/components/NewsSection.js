'use client';

import React from 'react';
import Image from 'next/image';

const news = [
  {
    id: 1,
    title: 'SAT anuncia la versión 3.1 del CCP',
    description: 'Lorem ipsum dolem',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'Liberación del sprint 8.3.1',
    description: 'Lorem ipsum dolem',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'Actualización 3.0 Módulo CPC',
    description: 'Lorem ipsum dolem',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=60'
  }
];

const NewsCard = ({ title, description, image }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer">
    <div className="relative h-48 w-full">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-200"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="p-4">
      <h3 className="text-gray-900 font-medium mb-2 group-hover:text-sky-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500">
        {description}
      </p>
    </div>
  </div>
);

const NewsSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 pb-12">
      <div className="mb-6">
        <h2 className="text-3xl text-sky-500 font-medium mb-1">Noticias</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <NewsCard
            key={item.id}
            title={item.title}
            description={item.description}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsSection;