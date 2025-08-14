'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { X, Package, Calendar, Clock, Building, AlertCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function CustomerStampsPackagesModal({ 
  isOpen, 
  cliente,
  onClose
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);

  // Cargar paquetes y proveedores cuando se abre el modal
  useEffect(() => {
    if (isOpen && cliente && cliente.idCustomerAdvanPac) {
      fetchPackages();
      fetchProviders();
    }
  }, [isOpen, cliente]);

  // Función para cargar los paquetes del cliente
  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/advanpac/customer-stamps/get-packages/${cliente.idCustomerAdvanPac}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Manejar diferentes tipos de respuesta
      if (Array.isArray(result)) {
        setPackages(result);
      } else if (result.data && Array.isArray(result.data)) {
        setPackages(result.data);
      } else {
        setPackages([]);
      }
      
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
      setError('Error al cargar los paquetes de timbres');
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar proveedores (para mostrar nombres en lugar de IDs)
  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/advanpac/pacs');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      setProviders(data);
      
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProviders([]);
    }
  };

  // Función para obtener el nombre del proveedor
  const getProviderName = (idProvider) => {
    const provider = providers.find(p => p.idProvider === idProvider);
    return provider ? provider.name : `Proveedor ${idProvider}`;
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para verificar si un paquete está expirado
  const isExpired = (expirationDate) => {
    try {
      return new Date(expirationDate) < new Date();
    } catch (error) {
      return false;
    }
  };

  // Función para obtener días restantes
  const getDaysRemaining = (expirationDate) => {
    try {
      const now = new Date();
      const expiry = new Date(expirationDate);
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  // Función para determinar si un paquete está próximo a vencer
  const isExpiringSoon = (expirationDate) => {
    const daysRemaining = getDaysRemaining(expirationDate);
    return daysRemaining <= 30 && daysRemaining > 0;
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setPackages([]);
    setProviders([]);
    setError(null);
    onClose();
  };

  // Calcular totales
  const totalPackages = packages.length;
  const totalStamps = packages.reduce((sum, pkg) => sum + pkg.count, 0);
  const expiredPackages = packages.filter(pkg => isExpired(pkg.expirationDate)).length;
  const expiringSoonPackages = packages.filter(pkg => isExpiringSoon(pkg.expirationDate)).length;

  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Paquetes de Timbres - {cliente.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualiza todos los paquetes de timbres asignados a este cliente
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Header con estadísticas en línea */}
          {!isLoading && !error && packages.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 sm:mb-0">
                Paquetes de Timbres
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {totalPackages} paquetes
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Timbres:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {totalStamps.toLocaleString()}
                  </span>
                </div>

                {expiringSoonPackages > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Por expirar:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {expiringSoonPackages}
                    </span>
                  </div>
                )}

                {expiredPackages > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Expirados:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {expiredPackages}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                Cargando paquetes...
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 dark:text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error al cargar paquetes
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchPackages}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C38] dark:hover:bg-[#3C3C48] text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!isLoading && !error && packages.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No hay paquetes de timbres
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Este cliente no tiene paquetes de timbres registrados.
              </p>
            </div>
          )}

          {/* Lista de paquetes - Grid como el StampsModal */}
          {!isLoading && !error && packages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const expired = isExpired(pkg.expirationDate);
                const daysRemaining = getDaysRemaining(pkg.expirationDate);
                const expiringSoon = !expired && isExpiringSoon(pkg.expirationDate);
                
                return (
                  <div
                    key={pkg.idStampPackage}
                    className={clsx(
                      "border rounded-lg p-4 transition-colors",
                      expired
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        : expiringSoon
                        ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                        : "border-gray-200 bg-white dark:border-[#2C2C38] dark:bg-[#1C1C24]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className={clsx(
                          "w-5 h-5",
                          expired
                            ? "text-red-500"
                            : expiringSoon
                            ? "text-yellow-500"
                            : "text-green-500"
                        )} />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {pkg.count.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          timbres
                        </span>
                      </div>
                      <span className={clsx(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        expired
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : expiringSoon
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      )}>
                        {expired ? 'Expirado' : expiringSoon ? 'Por expirar' : 'Activo'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4" />
                        <span>{getProviderName(pkg.idProvider)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Compra: {formatDate(pkg.buyDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Expira: {formatDate(pkg.expirationDate)}</span>
                      </div>
                      {!expired && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={clsx(
                            "text-sm font-medium",
                            expiringSoon ? "text-yellow-600 dark:text-yellow-400" : "text-gray-600 dark:text-gray-400"
                          )}>
                            {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Expira hoy'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}