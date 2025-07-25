"use client";

import {
  Eye,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Trash,
} from "lucide-react";

export default function NewsCard({
  item,
  handleOpenModal,
  handleConfirmStatusToggle,
  handleOpenPermissionsModal,
  onDelete,
}) {
  const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();

  const categoryValueStyle = "bg-primary text-white rounded-full px-2 py-0.5";

  const categoryTranslations = {
    COMMUNICATION: "Comunicados",
    MAINTENANCE_EXTERNAL: "Mantenimiento Externo",
    GENERAL_NEWS: "Noticias",
    LEGAL_NEWS: "Noticias Normativas",
    BLOG: "Blog",
    PRODUCTS_SERVICES: "Productos y Servicios",
    SUCCESS_STORY: "Casos de Éxito",
    PROMOTIONAL: "Promocional",
    CLOUD_PROMO: "Nube Promocional",
    UPCOMING_EVENTS: "Eventos Próximos",
    NEWS: "Noticias",
    ADVICE: "Consejo",
    NOTIFICATION: "Notificación",
  };

  return (
    <div
      className={`
        rounded-lg overflow-hidden
        border-b-4
        ${isExpired
          ? "border-red-500 bg-gray-200 dark:bg-gray-600 text-white"
          : item.status === "ACTIVE"
          ? "border-primary bg-white dark:bg-gray-7"
          : "border-gray-3 dark:border-gray-6 bg-white dark:bg-gray-7"
        }
        shadow-sm hover:shadow dark:hover:shadow-gray-900
        transition-all duration-300
        h-full flex flex-col font-poppins
      `} 
    >

      {/* Contenedor de imagen */}
      <div className="w-full min-h-[180px] aspect-[16/9] overflow-hidden bg-gray-1 dark:bg-gray-6 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-2 dark:text-gray-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      <div className="p-2.5 flex-grow flex flex-col">
        {/* Categoría y estado */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-4 dark:text-gray-3">Categoría:</span>
            <span className={categoryValueStyle}>
              {categoryTranslations[item.category] || item.category}
            </span>
          </div>
          <span
            className={`
              text-xs px-2 py-0.5 rounded-full
              ${
                item.status === "ACTIVE"
                  ? "bg-primary text-white"
                  : "bg-gray-2 text-gray-4 dark:bg-gray-6 dark:text-gray-3"
              }
            `}
          >
            {item.status === "ACTIVE" ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-sm font-medium mb-1 line-clamp-2 text-gray-5 dark:text-gray-2 leading-tight">
          {item.title}
        </h3>

        {/* Fecha */}
        <p className="text-xs font-regular mb-1.5 text-gray-3 dark:text-gray-3 leading-tight">
          {(() => {
            try {
              const originalDate = new Date(item.date);
              if (isNaN(originalDate.getTime())) return "Fecha no disponible";
              const adjustedDate = new Date(
                originalDate.getTime() - 6 * 3600_000
              );
              const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              };
              return `Publicado: ${adjustedDate.toLocaleDateString(
                "es-MX",
                options
              )}`;
            } catch {
              return `Publicado: ${item.date}`;
            }
          })()}
        </p>

        <p className="text-xs font-regular mb-1.5 text-gray-3 dark:text-gray-3 leading-tight flex items-center gap-2">
          {(() => {
            try {
              const originalDate = new Date(item.expirationDate);
              if (isNaN(originalDate.getTime())) return "Fecha no disponible";
              const adjustedDate = new Date(originalDate.getTime() - 6 * 3600_000);
              const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              };
              return (
                <>
                  <span>
                    Expira: {adjustedDate.toLocaleDateString("es-MX", options)}
                  </span>
                  {isExpired && (
                    <span className="bg-red-200 text-red-700 dark:bg-[#402020] dark:text-red-400 text-[10px] font-semibold rounded-full px-2 py-0.5">
                      Expirada
                    </span>
                  )}
                </>
              );
            } catch {
              return `Expira: ${item.expirationDate}`;
            }
          })()}
        </p>

        {/* Acciones */}
        <div className="border-t border-gray-1 dark:border-gray-6 pt-1.5 flex justify-between items-center mt-auto">
          <div className="flex gap-1">
            <button
              onClick={() => handleOpenModal("view", item)}
              className="p-1 rounded hover:bg-gray-1 dark:hover:bg-gray-6 transition-colors"
              title="Ver detalles"
              aria-label="Ver detalles"
            >
              <Eye
                size={18}
                className="text-gray-4 dark:text-gray-3 hover:text-primary"
              />
            </button>
            <button
              onClick={() => handleOpenModal("edit", item)}
              className="p-1 rounded hover:bg-gray-1 dark:hover:bg-gray-6 transition-colors"
              title="Editar"
              aria-label="Editar"
            >
              <Edit
                size={18}
                className="text-gray-4 dark:text-gray-3 hover:text-primary"
              />
            </button>

            <button
              onClick={() => handleOpenPermissionsModal(item.id)}
              className="p-1 rounded hover:bg-gray-1 dark:hover:bg-gray-6 transition-colors group relative"
              title="Configurar audiencia"
              aria-label="Configurar audiencia"
            >
              <Users
                size={18}
                className="text-gray-4 dark:text-gray-3 group-hover:text-primary"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => onDelete(item)}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              title="Eliminar"
              aria-label="Eliminar"
            >
              <Trash
                size={18}
                className="text-gray-4 dark:text-gray-3 hover:text-red-500 dark:hover:text-red-400"
              />
            </button>
          </div>

          <button
            onClick={() => handleConfirmStatusToggle(item.id)}
            className="p-1 rounded hover:bg-gray-1 dark:hover:bg-gray-6 transition-colors"
            title={item.status === "ACTIVE" ? "Desactivar" : "Activar"}
            aria-label={item.status === "ACTIVE" ? "Desactivar" : "Activar"}
          >
            {item.status === "ACTIVE" ? (
              <ArrowDownCircle
                size={18}
                className="text-gray-4 dark:text-gray-3 hover:text-primary"
              />
            ) : (
              <ArrowUpCircle
                size={18}
                className="text-gray-4 dark:text-gray-3 hover:text-primary"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
