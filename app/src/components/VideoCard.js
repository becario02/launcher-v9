'use client';

import { Eye, Edit, Trash2, Video, ExternalLink, PlayCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import clsx from 'clsx';

export default function VideoCard({ video, onView, onEdit, onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Función para obtener el thumbnail del video
  const getVideoThumbnail = (url) => {
    try {
      const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const thumbnail = getVideoThumbnail(video.url);

  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#1C1C24] rounded-lg overflow-hidden',
        'border-b-4',
        video.status === 'ACTIVE' ? 'border-primary' : 'border-gray-300 dark:border-gray-600',
        'shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30',
        'transition-all duration-300 h-full flex flex-col',
        'font-poppins'
      )}
    >
      {/* Thumbnail - clickable ahora */}
      <div 
        className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={() => onView('view', video)}
      >
        {thumbnail ? (
          <>
            <img
              src={thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay de play */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </>
        ) : (
          <>
            <Video className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            {/* Overlay de play para videos sin thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayCircle className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {/* Estado */}
        <div className="flex justify-end mb-2">
          <span
            className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              video.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-white'
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-white'
            )}
          >
            {video.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-medium mb-2 line-clamp-2 text-gray-900 dark:text-white">
          {video.title}
        </h3>

        {/* URL */}
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-4"
          onClick={(e) => e.stopPropagation()} // Evitar que abra el modal al hacer clic en el enlace
        >
          <span className="truncate">Ver video</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>

        {/* Fecha */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {new Date(video.uploadDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {/* Acciones */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-2">
          <button
            onClick={() => onView('view', video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>
          <button
            onClick={() => onEdit('edit', video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition text-sm"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onDelete(video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}