import { 
  Rocket, 
  Settings, 
  RefreshCw, 
  Newspaper, 
  Video, 
  FileText, 
  Calendar, 
  Coffee,
  GitBranch,
  HelpCircle 
} from 'lucide-react';

// Componente para mostrar la categoría con un color distintivo
const CategoryBadge = ({ category }) => {
  const categoryConfig = {
    VERSION_RELEASE: { 
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400', 
      label: 'Lanzamiento de Versión',
      icon: Rocket
    },
    MAINTENANCE_WINDOW: { 
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400', 
      label: 'Ventana de Mantenimiento',
      icon: Settings
    },
    ERP_UPDATE: { 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400', 
      label: 'Actualización ERP',
      icon: RefreshCw
    },
    NEWS: { 
      className: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400', 
      label: 'Noticias',
      icon: Newspaper
    },
    NEWVIDEO: { 
      className: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400', 
      label: 'Nuevo Video',
      icon: Video
    },
    NEWARTICLE: { 
      className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-400', 
      label: 'Nuevo Artículo',
      icon: FileText
    },
    NEWEVENT: { 
      className: 'bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-400', 
      label: 'Nuevo Evento',
      icon: Calendar
    },
    HOLIDAY: { 
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400', 
      label: 'Días Festivos',
      icon: Coffee
    },
    CHANGELOG: { 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400', 
      label: 'Registro de Cambios',
      icon: GitBranch
    },
    // Mantener categorías legacy por compatibilidad (si aún existen datos con estas categorías)
    SYSTEMUPDATE: { 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400', 
      label: 'Actualización del Sistema',
      icon: RefreshCw
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