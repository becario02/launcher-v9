'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  Building2, 
  User, 
  Clock 
} from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function FileContentModal({ 
  isOpen, 
  onClose, 
  file, 
  onError 
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Limpiar estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFileContent('');
      setIsLoading(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Cargar contenido cuando se abre el modal o cambia el archivo
  useEffect(() => {
    if (isOpen && file) {
      fetchFileContent();
    }
  }, [isOpen, file]);

  // Función para cargar el contenido del archivo
  const fetchFileContent = async () => {
    setIsLoading(true);
    setFileContent('');

    try {
      const response = await fetch(
        `/api/file-content?idFile=${file.idFile}`,
        {
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          // Intentar formatear el JSON si es válido
          try {
            const parsedContent = JSON.parse(result.data);
            setFileContent(JSON.stringify(parsedContent, null, 2));
          } catch (e) {
            // Si no es JSON válido, mostrar el contenido tal como viene
            setFileContent(result.data);
          }
        }
      } else {
        onError?.('Error al cargar el contenido del archivo');
        handleClose();
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      onError?.('Error de conexión al cargar el contenido');
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Función para copiar contenido
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      onError?.('Error al copiar el contenido');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para cerrar el modal
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contenido del archivo
            </h2>
            {file && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {file.fileName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              disabled={isLoading || !fileContent}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cargando contenido del archivo...
                  </p>
                </div>
              </div>
            ) : fileContent ? (
              <div className="space-y-4">
                {/* Información del archivo */}
                {file && (
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-[#13131a] rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="w-4 h-4" />
                      <span>{file.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{file.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                  </div>
                )}

                {/* Contenido del archivo */}
                <div className="bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-[#2C2C38] rounded-lg">
                  <div className="p-2 border-b border-gray-200 dark:border-[#2C2C38] bg-gray-100 dark:bg-[#1C1C24]">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      JSON Content
                    </span>
                  </div>
                  <div className="p-4 max-h-[50vh] overflow-auto">
                    <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                      {fileContent}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No se pudo cargar el contenido del archivo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cargando...' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
}