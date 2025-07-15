'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { X, Package, Plus, Calendar, Clock, AlertCircle, Minus } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function StampsModal({ 
  isOpen, 
  pac,
  onClose
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubtracting, setIsSubtracting] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'subtract'

  // Estados del formulario
  const [formData, setFormData] = useState({
    count: '',
    buyDate: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  });

  // Estados del formulario de resta
  const [subtractFormData, setSubtractFormData] = useState({
    amount: ''
  });

  // Estados de UI
  const [errors, setErrors] = useState({});

  // Cargar paquetes cuando se abre el modal
  useEffect(() => {
    if (isOpen && pac) {
      fetchPackages();
      setCurrentView('list');
      setFormData({
        count: '',
        buyDate: new Date().toISOString().split('T')[0]
      });
      setSubtractFormData({
        amount: ''
      });
      setErrors({});
      setIsSubtracting(false);
    }
  }, [isOpen, pac]);

  // Función para cargar paquetes de timbres
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.50.77.181:83/msadvan_pac/api/v1/advan_stamps/get_packages/${pac.idProvider}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar si la respuesta es un array (tiene paquetes) o un objeto con mensaje de error
      if (Array.isArray(data)) {
        setPackages(data);
      } else if (data.statusCode === "201" && data.message) {
        // No hay paquetes disponibles
        setPackages([]);
      } else {
        // Cualquier otro caso, usar array vacío
        setPackages([]);
      }
      
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para verificar si un paquete está expirado
  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date();
  };

  // Función para obtener días restantes
  const getDaysRemaining = (expirationDate) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Manejar cambios en el formulario de resta
  const handleSubtractInputChange = (e) => {
    const { value } = e.target;
    setSubtractFormData({
      amount: value
    });

    // Limpiar errores
    if (errors.subtractAmount) {
      setErrors(prev => ({
        ...prev,
        subtractAmount: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.count || formData.count <= 0) {
      newErrors.count = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.buyDate) {
      newErrors.buyDate = 'La fecha de compra es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear nuevo paquete de timbres
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://10.50.77.181:83/msadvan_pac/api/v1/advan_stamps/add_stamps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idProvider: pac.idProvider,
          Count: parseInt(formData.count),
          buyDate: formData.buyDate
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Recargar paquetes
        await fetchPackages();
        
        // Resetear formulario
        setFormData({
          count: '',
          buyDate: new Date().toISOString().split('T')[0]
        });
        setCurrentView('list');
        setErrors({});
      } else {
        setErrors({ server: 'Error al crear el paquete de timbres' });
      }
    } catch (error) {
      console.error('Error al crear paquete:', error);
      setErrors({ server: 'Error de conexión al crear el paquete' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restar timbres del proveedor (desde el más antiguo)
  const handleSubtractStamps = async () => {
    if (!subtractFormData.amount || subtractFormData.amount <= 0) {
      setErrors({ subtractAmount: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const totalStamps = packages.reduce((sum, pkg) => sum + pkg.count, 0);
    if (parseInt(subtractFormData.amount) > totalStamps) {
      setErrors({ subtractAmount: 'La cantidad no puede ser mayor a los timbres disponibles' });
      return;
    }

    setIsSubtracting(true);

    try {
      const response = await fetch(`http://10.50.77.181:83/msadvan_pac/api/v1/advan_stamps/substract_stamps/${pac.idProvider}/${subtractFormData.amount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ''
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        // Recargar paquetes
        await fetchPackages();
        
        // Resetear formulario
        setSubtractFormData({ amount: '' });
        setCurrentView('list');
        setErrors({});
      } else {
        setErrors({ server: result.message || 'Error al restar timbres' });
      }
    } catch (error) {
      console.error('Error al restar timbres:', error);
      setErrors({ server: 'Error de conexión al restar timbres' });
    } finally {
      setIsSubtracting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting && !isSubtracting) {
      setCurrentView('list');
      setFormData({
        count: '',
        buyDate: new Date().toISOString().split('T')[0]
      });
      setSubtractFormData({
        amount: ''
      });
      setErrors({});
      setIsSubtracting(false);
      onClose();
    }
  };

  // Función para volver a la vista principal
  const handleBackToList = () => {
    setCurrentView('list');
    setFormData({
      count: '',
      buyDate: new Date().toISOString().split('T')[0]
    });
    setSubtractFormData({
      amount: ''
    });
    setErrors({});
  };

  if (!isOpen || !pac) return null;

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
              {currentView === 'add' ? 'Agregar Paquete de Timbres' :
               currentView === 'subtract' ? 'Cambiar Cantidad de Timbres' :
               `Gestión de Timbres - ${pac.name}`}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentView === 'add' ? 'Crea un nuevo paquete de timbres para este PAC' :
               currentView === 'subtract' ? 'Resta timbres comenzando por los paquetes más antiguos' :
               'Administra los paquetes de timbres asignados a este PAC'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isSubtracting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Vista de Lista de Paquetes */}
          {currentView === 'list' && (
            <>
              {/* Botones para agregar y cambiar cantidad */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Paquetes de Timbres
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('subtract')}
                    disabled={isLoading || packages.length === 0 || packages.reduce((sum, pkg) => sum + pkg.count, 0) === 0}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                  >
                    Cambiar Cantidad
                  </button>
                  <button
                    onClick={() => setCurrentView('add')}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Paquete
                  </button>
                </div>
              </div>

              {/* Lista de paquetes */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      Cargando paquetes...
                    </div>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No hay paquetes de timbres
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Este PAC aún no tiene paquetes de timbres asignados.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => {
                      const expired = isExpired(pkg.expirationDate);
                      const daysRemaining = getDaysRemaining(pkg.expirationDate);
                      const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

                      return (
                        <div
                          key={pkg.idStampPackage}
                          className={clsx(
                            "border rounded-lg p-4 transition-colors",
                            expired
                              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                              : isExpiringSoon
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
                                  : isExpiringSoon
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
                                : isExpiringSoon
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            )}>
                              {expired ? 'Expirado' : isExpiringSoon ? 'Por expirar' : 'Activo'}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
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
                                  isExpiringSoon ? "text-yellow-600 dark:text-yellow-400" : "text-gray-600 dark:text-gray-400"
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
            </>
          )}

          {/* Vista de Agregar Paquete */}
          {currentView === 'add' && (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cantidad de Timbres *
                    </label>
                    <input
                      type="number"
                      name="count"
                      value={formData.count}
                      onChange={handleInputChange}
                      placeholder="100"
                      min="1"
                      disabled={isSubmitting}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                        errors.count
                          ? "border-red-300 dark:border-red-500"
                          : "border-gray-300 dark:border-[#2C2C38]"
                      )}
                      style={!errors.count ? { '--tw-ring-color': primaryColor } : {}}
                    />
                    {errors.count && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.count}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Compra *
                    </label>
                    <input
                      type="date"
                      name="buyDate"
                      value={formData.buyDate}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={clsx(
                        "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                        errors.buyDate
                          ? "border-red-300 dark:border-red-500"
                          : "border-gray-300 dark:border-[#2C2C38]"
                      )}
                      style={!errors.buyDate ? { '--tw-ring-color': primaryColor } : {}}
                    />
                    {errors.buyDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.buyDate}
                      </p>
                    )}
                  </div>
                </div>

                {errors.server && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.server}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Crear Paquete
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vista de Cambiar Cantidad */}
          {currentView === 'subtract' && (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cantidad a Restar *
                  </label>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={subtractFormData.amount}
                    onChange={handleSubtractInputChange}
                    min="1"
                    max={packages.reduce((sum, pkg) => sum + pkg.count, 0)}
                    disabled={isSubtracting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                      errors.subtractAmount
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={!errors.subtractAmount ? { '--tw-ring-color': primaryColor } : {}}
                  />
                  {errors.subtractAmount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.subtractAmount}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Total disponible: <strong>{packages.reduce((sum, pkg) => sum + pkg.count, 0).toLocaleString()}</strong> timbres
                  </p>
                </div>

                {errors.server && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.server}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    disabled={isSubtracting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubtractStamps}
                    disabled={isSubtracting || !subtractFormData.amount}
                    className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubtracting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Restando...
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4" />
                        Restar Timbres
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón de cerrar */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-[#2C2C38]">
          <button
            onClick={handleClose}
            disabled={isSubmitting || isSubtracting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}