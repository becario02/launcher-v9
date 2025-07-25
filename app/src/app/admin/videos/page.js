"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import clsx from "clsx";
import {
  Video,
  Search,
  PlusCircle,
  Trash2,
  Grid,
  List,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePrimaryColor } from "@/context/primaryColor";
import { useTheme } from "@/context/ThemeContext";
import Toast from "@/components/Toast";
import VideoFormModal from "@/components/VideoFormModal";
import VideoGrid from "@/components/VideoGrid";
import VideoConfirmDeleteModal from "@/components/VideoConfirmDeleteModal";

export default function AdminVideosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalVideos, setTotalVideos] = useState(0);
  const [viewMode, setViewMode] = useState("table");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/videos", {
        params: {
          page,
          pageSize,
          title: search || null,
          status: statusFilter !== "all" ? statusFilter : null,
        },
      });

      const responseData = response.data;
      setVideos(responseData.data || []);
      setTotalVideos(responseData.total || 0);
    } catch (error) {
      setToast({
        visible: true,
        message: "Error al cargar los videos",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVideos();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search, statusFilter]);

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // Manejadores del modal
  const handleOpenModal = (type, video = null) => {
    setModalType(type);
    setCurrentVideo(video);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentVideo(null);
    setModalType("add");
  };

  // Guardar video
  const handleSaveVideo = async (data) => {
    try {
      if (modalType === "edit" && currentVideo) {
        await axios.put("/api/videos", {
          idVideo: currentVideo.idVideo,
          ...data,
        });
        setToast({
          visible: true,
          message: "Video actualizado exitosamente",
          type: "success",
        });
      } else {
        await axios.post("/api/videos", data);
        setToast({
          visible: true,
          message: "Video creado exitosamente",
          type: "success",
        });
      }
      handleCloseModal();
      fetchVideos();
    } catch (error) {
      console.error("Error al guardar video:", error);
      setToast({
        visible: true,
        message: "Error al guardar el video",
        type: "error",
      });
    }
  };

  // Eliminar video
  const handleDeleteVideo = async (idVideo) => {
    try {
      await axios.delete("/api/videos", {
        params: { idVideo },
      });
      setToast({
        visible: true,
        message: "Video eliminado exitosamente",
        type: "success",
      });
      fetchVideos();
    } catch (error) {
      console.error("Error al eliminar video:", error);
      setToast({
        visible: true,
        message: "Error al eliminar el video",
        type: "error",
      });
    }
  };

  // Manejar la apertura del modal de confirmación
  const handleOpenDeleteConfirm = (video) => {
    setVideoToDelete(video);
    setConfirmDeleteModalOpen(true);
  };

  // Manejar el cierre del modal de confirmación
  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteModalOpen(false);
    setVideoToDelete(null);
  };

  // Cerrar toast
  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="text-center py-20">
      <Video className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {search
          ? `No se encontraron videos que coincidan con "${search}"`
          : "No hay videos registrados"}
      </h3>
      <p className="text-gray-500 dark:text-gray-500 mb-4">
        {search
          ? "Intenta con otros términos de búsqueda"
          : "Comienza agregando un nuevo video"}
      </p>
      {!search && (
        <button
          onClick={() => handleOpenModal("add")}
          style={{ backgroundColor: primaryColor }}
          className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar video
        </button>
      )}
    </div>
  );

  // Componente de Skeleton para la tabla
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </td>
    </tr>
  );

  function formatMexicanDate(dateStringUTC) {
    const utc = new Date(dateStringUTC + "Z");
    return utc.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Mexico_City",
    });
  }

  return (
    <div className="flex font-poppins">
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden md:block fixed z-10 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 w-full md:pl-60">
        {/* Navbar*/}
        <Navbar
          className="sticky top-0 z-30"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main content */}
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="w-6 h-6 text-primary" />
                    <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                      Administración de Videos
                    </h1>
                  </div>
                  <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                    Gestiona todos los videos de la plataforma.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => handleOpenModal("add")}
                >
                  <PlusCircle className="w-4 h-4" />
                  Nuevo video
                </button>
              </div>

              {/* Buscador y filtros */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                  <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por título..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                    />
                    {search && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                  </select>
                </div>

                {/* Botones de vista */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={clsx(
                      "p-2 rounded-md transition-colors",
                      viewMode === "table"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-[#2C2C38] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={clsx(
                      "p-2 rounded-md transition-colors",
                      viewMode === "grid"
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-[#2C2C38] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            {viewMode === "table" ? (
              <div className="rounded-lg border border-gray-200 dark:border-[#2C2C38] shadow-sm bg-white dark:bg-[#1C1C24] overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F9FAFB] dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                    <tr>
                      {[
                        "Título",
                        "URL",
                        "Estado",
                        "Fecha de subida",
                        "Acciones",
                      ].map((label, i) => (
                        <th key={i} className="px-6 py-4 whitespace-nowrap">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2C2C38] text-gray-800 dark:text-gray-200">
                    {isLoading ? (
                      <>
                        {[...Array(pageSize)].map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))}
                      </>
                    ) : videos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4">
                          <EmptyState />
                        </td>
                      </tr>
                    ) : (
                      videos.map((video) => (
                        <tr
                          key={video.idVideo}
                          className="hover:bg-gray-50 dark:hover:bg-[#262636] transition"
                        >
                          <td className="px-6 py-4 font-medium">
                            {video.title}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs inline-block"
                            >
                              {video.url}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={clsx(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                video.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-white"
                                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-white"
                              )}
                            >
                              {video.status === "ACTIVE"
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {formatMexicanDate(video.uploadDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal("view", video)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Ver</span>
                              </button>
                              <button
                                onClick={() => handleOpenModal("edit", video)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                  Editar
                                </span>
                              </button>
                              <button
                                onClick={() => handleOpenDeleteConfirm(video)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">
                                  Eliminar
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {totalVideos > 0 ? (
                      <>
                        Mostrando{" "}
                        {Math.min((page - 1) * pageSize + 1, totalVideos)} -{" "}
                        {Math.min(page * pageSize, totalVideos)} de{" "}
                        {totalVideos}
                      </>
                    ) : (
                      "No hay resultados"
                    )}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1 || isLoading || totalVideos === 0}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className={clsx(
                        "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                        "transition focus:outline-none",
                        page === 1 || isLoading || totalVideos === 0
                          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </button>
                    <button
                      disabled={
                        page * pageSize >= totalVideos ||
                        isLoading ||
                        totalVideos === 0
                      }
                      onClick={() => setPage((prev) => prev + 1)}
                      className={clsx(
                        "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                        "transition focus:outline-none",
                        page * pageSize >= totalVideos ||
                          isLoading ||
                          totalVideos === 0
                          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                      )}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <VideoGrid
                videos={videos}
                onView={handleOpenModal}
                onEdit={handleOpenModal}
                onDelete={handleOpenDeleteConfirm}
                isLoading={isLoading}
                search={search}
              />
            )}

            {/* Paginación para vista de grilla */}
            {viewMode === "grid" && totalVideos > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {Math.min((page - 1) * pageSize + 1, totalVideos)} -{" "}
                  {Math.min(page * pageSize, totalVideos)} de {totalVideos}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={clsx(
                      "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page === 1 || isLoading
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  <button
                    disabled={page * pageSize >= totalVideos || isLoading}
                    onClick={() => setPage((prev) => prev + 1)}
                    className={clsx(
                      "inline-flex items-center px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-200",
                      "transition focus:outline-none",
                      page * pageSize >= totalVideos || isLoading
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#2C2C38]"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48]"
                    )}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modales */}
        <VideoFormModal
          isOpen={modalOpen}
          modalType={modalType}
          video={currentVideo}
          onClose={handleCloseModal}
          onSubmit={handleSaveVideo}
        />

        {/* Modal de confirmación para eliminar */}
        <VideoConfirmDeleteModal
          isOpen={confirmDeleteModalOpen}
          video={videoToDelete}
          onClose={handleCloseDeleteConfirm}
          onConfirm={handleDeleteVideo}
        />

        {/* Toast */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}
      </div>
    </div>
  );
}
