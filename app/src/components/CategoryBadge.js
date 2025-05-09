import { RefreshCw, Video, FileText, HelpCircle } from 'lucide-react';

// Componente para mostrar la categoría con un color distintivo
const CategoryBadge = ({ category }) => {
  const categoryConfig = {
    SYSTEMUPDATE: { 
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400', 
      label: 'Actualización del Sistema',
      icon: RefreshCw
    },
    NEWVIDEO: { 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400', 
      label: 'Nuevo Video',
      icon: Video
    },
    NEWARTICLE: { 
      className: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400', 
      label: 'Nuevo Artículo',
      icon: FileText
    },
    NA: { 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300', 
      label: 'Sin Categoría',
      icon: HelpCircle
    }
  };

  const config = categoryConfig[category] || { 
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300', 
    label: category || 'Desconocida',
    icon: HelpCircle
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default CategoryBadge;