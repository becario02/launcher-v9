'use client';

import VideoCard from './VideoCard';
import { Video } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

export default function VideoGrid({ videos, onView, onEdit, onDelete, isLoading, search }) {
  const { primaryColor } = usePrimaryColor();

  // Estado vacío
  const EmptyState = () => (
    <div className="text-center py-12">
      <Video className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search ? `No se encontraron videos que coincidan con "${search}"` : 'No hay videos registrados'}
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando un nuevo video'}
      </p>
    </div>
  );

  // Skeleton Card - reducido en altura
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-[#1C1C24] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
        <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex gap-1">
          <div className="h-6 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map(video => (
        <VideoCard
          key={video.idVideo}
          video={video}
          onView={() => onView('view', video)}
          onEdit={() => onEdit('edit', video)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}