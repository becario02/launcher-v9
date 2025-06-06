'use client';

import { useState } from 'react';
import { X, Eye, Code, FileText, Copy, Check } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import clsx from 'clsx';

export default function ViewAddendaModal({ isOpen, onClose, addenda }) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('travel');
  const [copiedStates, setCopiedStates] = useState({});

  // Función para manejar cierre del modal
  const handleClose = () => {
    onClose();
  };

  // Función para copiar contenido al portapapeles
  const copyToClipboard = async (content, type) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      
      // Limpiar el estado después de 2 segundos
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  // Obtener las estructuras disponibles
  const getAvailableStructures = () => {
    const structures = [];
    
    if (addenda?.structureTravel) {
      structures.push({
        key: 'travel',
        name: 'Viaje',
        content: addenda.structureTravel,
        color: 'blue'
      });
    }
    
    if (addenda?.structureAdditionalInvoice) {
      structures.push({
        key: 'invoice',
        name: 'Factura Adicional',
        content: addenda.structureAdditionalInvoice,
        color: 'green'
      });
    }
    
    if (addenda?.structureCreditNote) {
      structures.push({
        key: 'credit',
        name: 'Nota de Crédito',
        content: addenda.structureCreditNote,
        color: 'orange'
      });
    }
    
    return structures;
  };

  const availableStructures = getAvailableStructures();

  // Establecer la primera estructura disponible como activa si la actual no existe
  if (availableStructures.length > 0 && !availableStructures.find(s => s.key === activeTab)) {
    setActiveTab(availableStructures[0].key);
  }

  const currentStructure = availableStructures.find(s => s.key === activeTab);

  if (!isOpen || !addenda) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ver Addenda - {addenda.name}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Info de la addenda */}
            <div className="p-4 bg-gray-50 dark:bg-[#262631] rounded-lg border border-gray-200 dark:border-[#2C2C38]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {addenda.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>ID: {addenda.idAddenda}</span>
                    <span className={clsx(
                      "font-medium",
                      addenda.status === 'ACTIVE' ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {addenda.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Estructuras disponibles
                  </p>
                  <div className="flex gap-1">
                    {availableStructures.map(structure => (
                      <span 
                        key={structure.key}
                        className={clsx(
                          "px-2 py-1 rounded text-xs font-medium",
                          structure.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
                          structure.color === 'green' && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                          structure.color === 'orange' && "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                        )}
                      >
                        {structure.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {availableStructures.length === 0 ? (
              /* No hay estructuras */
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No hay estructuras configuradas
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Esta addenda no tiene estructuras XML configuradas.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Estructuras XML */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      Estructuras XML
                    </h3>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-[#2C2C38]">
                    <div className="flex">
                      {availableStructures.map(structure => (
                        <button
                          key={structure.key}
                          onClick={() => setActiveTab(structure.key)}
                          className={clsx(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === structure.key
                              ? "border-primary text-primary"
                              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          )}
                          style={activeTab === structure.key ? { 
                            borderBottomColor: primaryColor,
                            color: primaryColor 
                          } : {}}
                        >
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            {structure.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* XML Content */}
                  {currentStructure && (
                    <div className="space-y-4">
                      {/* Toolbar */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262631] border border-gray-200 dark:border-[#2C2C38] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Estructura XML - {currentStructure.name}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(currentStructure.content, currentStructure.key)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors"
                        >
                          {copiedStates[currentStructure.key] ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copiar XML
                            </>
                          )}
                        </button>
                      </div>

                      {/* XML Display */}
                      <div className="bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] overflow-hidden">
                        <pre className="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                          {currentStructure.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Botón de cierre */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}