'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X, Building, Plus, AlertCircle, Search, ChevronDown, Check } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function AddClientModal({ 
  isOpen, 
  onClose, 
  onSubmit
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Datos de ejemplo de compañías
  const [companies] = useState([
    { id: 1, companyIdentifier: 'COMP-001', name: 'Empresa Tecnológica SA' },
    { id: 2, companyIdentifier: 'INT-TRAN', name: 'Internacional de Transporte' },
    { id: 3, companyIdentifier: 'RETAIL-MX', name: 'Retail México Corp' },
    { id: 4, companyIdentifier: 'LOGIS-PRO', name: 'Logística Profesional' },
    { id: 5, companyIdentifier: 'CONSTRUCT', name: 'Constructora del Norte' },
    { id: 6, companyIdentifier: 'PHARMA-LAB', name: 'Laboratorios Farmacéuticos Unidos' },
    { id: 7, companyIdentifier: 'AUTO-PARTS', name: 'Autopartes Industriales' },
    { id: 8, companyIdentifier: 'FOOD-DIST', name: 'Distribuidora de Alimentos' }
  ]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    selectedCompany: null,
    customerIdentifier: '',
    name: '',
    stampsWarning: '',
    stampsWarningNotification: '',
    stampsCritical: '',
    stampsCriticalNotification: '',
    stampsFatal: '',
    stampsFatalNotification: ''
  });

  // Estados para el selector de compañías
  const [companySearch, setCompanySearch] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const companyDropdownRef = useRef(null);

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Filtrar compañías según búsqueda
  useEffect(() => {
    if (companySearch.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        company.companyIdentifier.toLowerCase().includes(companySearch.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companySearch, companies]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        selectedCompany: null,
        customerIdentifier: '',
        name: '',
        stampsWarning: '',
        stampsWarningNotification: '',
        stampsCritical: '',
        stampsCriticalNotification: '',
        stampsFatal: '',
        stampsFatalNotification: ''
      });
      setCompanySearch('');
      setIsCompanyDropdownOpen(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    return (
      formData.selectedCompany &&
      formData.stampsWarning.trim() &&
      formData.stampsWarningNotification.trim() &&
      formData.stampsCritical.trim() &&
      formData.stampsCriticalNotification.trim() &&
      formData.stampsFatal.trim() &&
      formData.stampsFatalNotification.trim()
    );
  };

  // Limpiar formulario cuando se cierra el modal
  const resetForm = () => {
    setFormData({
      selectedCompany: null,
      customerIdentifier: '',
      name: '',
      stampsWarning: '',
      stampsWarningNotification: '',
      stampsCritical: '',
      stampsCriticalNotification: '',
      stampsFatal: '',
      stampsFatalNotification: ''
    });
    setCompanySearch('');
    setErrors({});
    setIsSubmitting(false);
  };

  // Validar emails (pueden ser múltiples separados por ;)
  const validateEmails = (emailString) => {
    if (!emailString.trim()) return false;
    
    const emails = emailString.split(';').map(email => email.trim()).filter(email => email !== '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emails.every(email => emailRegex.test(email));
  };

  // Manejar selección de compañía
  const handleCompanySelect = (company) => {
    setFormData(prev => ({
      ...prev,
      selectedCompany: company,
      customerIdentifier: company.companyIdentifier,
      name: company.name
    }));
    setCompanySearch(`${company.companyIdentifier} - ${company.name}`);
    setIsCompanyDropdownOpen(false);
    
    // Limpiar error de compañía si existía
    if (errors.selectedCompany) {
      setErrors(prev => ({ ...prev, selectedCompany: undefined }));
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Limpiar errores de servidor cuando el usuario haga cambios
    if (errors.server) {
      setErrors(prev => ({
        ...prev,
        server: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.selectedCompany) {
      newErrors.selectedCompany = 'Debe seleccionar una compañía';
    }

    // Validar números de stamps
    if (!formData.stampsWarning.trim()) {
      newErrors.stampsWarning = 'El límite de advertencia es requerido';
    } else if (isNaN(Number(formData.stampsWarning)) || Number(formData.stampsWarning) < 1) {
      newErrors.stampsWarning = 'Debe ser un número válido mayor a 0';
    }

    if (!formData.stampsCritical.trim()) {
      newErrors.stampsCritical = 'El límite crítico es requerido';
    } else if (isNaN(Number(formData.stampsCritical)) || Number(formData.stampsCritical) < 1) {
      newErrors.stampsCritical = 'Debe ser un número válido mayor a 0';
    }

    if (!formData.stampsFatal.trim()) {
      newErrors.stampsFatal = 'El límite fatal es requerido';
    } else if (isNaN(Number(formData.stampsFatal)) || Number(formData.stampsFatal) < 1) {
      newErrors.stampsFatal = 'Debe ser un número válido mayor a 0';
    }

    // Validar que fatal < crítico < advertencia
    const warning = Number(formData.stampsWarning);
    const critical = Number(formData.stampsCritical);
    const fatal = Number(formData.stampsFatal);

    if (!isNaN(warning) && !isNaN(critical) && !isNaN(fatal)) {
      if (fatal >= critical) {
        newErrors.stampsFatal = 'El límite fatal debe ser menor al crítico';
      }
      if (critical >= warning) {
        newErrors.stampsCritical = 'El límite crítico debe ser menor al de advertencia';
      }
    }

    // Validar emails
    if (!formData.stampsWarningNotification.trim()) {
      newErrors.stampsWarningNotification = 'Los emails de advertencia son requeridos';
    } else if (!validateEmails(formData.stampsWarningNotification)) {
      newErrors.stampsWarningNotification = 'Formato de email inválido. Use ";" para separar múltiples emails';
    }

    if (!formData.stampsCriticalNotification.trim()) {
      newErrors.stampsCriticalNotification = 'Los emails críticos son requeridos';
    } else if (!validateEmails(formData.stampsCriticalNotification)) {
      newErrors.stampsCriticalNotification = 'Formato de email inválido. Use ";" para separar múltiples emails';
    }

    if (!formData.stampsFatalNotification.trim()) {
      newErrors.stampsFatalNotification = 'Los emails fatales son requeridos';
    } else if (!validateEmails(formData.stampsFatalNotification)) {
      newErrors.stampsFatalNotification = 'Formato de email inválido. Use ";" para separar múltiples emails';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para envío
      const submitData = {
        CustomerIdentifier: formData.customerIdentifier,
        Name: formData.name,
        StampsWarning: formData.stampsWarning,
        StampsWarningNotification: formData.stampsWarningNotification,
        StampsCritical: formData.stampsCritical,
        StampsCriticalNotification: formData.stampsCriticalNotification,
        StampsFatal: formData.stampsFatal,
        StampsFatalNotification: formData.stampsFatalNotification
      };

      // TODO: Implementar llamada real a la API
      console.log('Datos a enviar:', submitData);

      // Simulación temporal de éxito
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit({
        success: true,
        message: 'Cliente agregado exitosamente'
      });
      
      handleClose();

    } catch (error) {
      console.error('Error al crear cliente:', error);
      setErrors(prev => ({
        ...prev,
        server: 'Error de conexión al crear el cliente'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Agregar Cliente AdvanPAC
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configura los límites de timbres y notificaciones para el nuevo cliente
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Selector de Compañía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Compañía *
              </label>
              <div className="relative" ref={companyDropdownRef}>
                <div
                  className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white flex items-center justify-between",
                    errors.selectedCompany
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o identificador..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      onFocus={() => setIsCompanyDropdownOpen(true)}
                      className="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <ChevronDown className={clsx(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isCompanyDropdownOpen && "rotate-180"
                    )} />
                  </button>
                </div>

                {/* Dropdown */}
                {isCompanyDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          className={clsx(
                            "px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2C2C38] flex items-center justify-between",
                            formData.selectedCompany?.id === company.id && "bg-blue-50 dark:bg-blue-900/20"
                          )}
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {company.companyIdentifier}
                            </div>
                          </div>
                          {formData.selectedCompany?.id === company.id && (
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                        No se encontraron compañías
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.selectedCompany && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.selectedCompany}
                </p>
              )}
              
            </div>

            {/* Información de la compañía seleccionada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Identificador del Cliente
                </label>
                <input
                  type="text"
                  value={formData.customerIdentifier}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-gray-50 dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300"
                  placeholder="Se llenará automáticamente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-gray-50 dark:bg-[#2C2C38] text-gray-700 dark:text-gray-300"
                  placeholder="Se llenará automáticamente"
                />
              </div>
            </div>

            {/* Configuración de Timbres */}
            <>
                <div className="border-t border-gray-200 dark:border-[#2C2C38] pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Configuración de Límites de Timbres
                  </h3>
                  
                  {/* Límites de Advertencia */}
                  <div className="space-y-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Advertencia</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Límite de Timbres *
                        </label>
                        <input
                          type="number"
                          name="stampsWarning"
                          value={formData.stampsWarning}
                          onChange={handleInputChange}
                          placeholder="200"
                          min="1"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsWarning
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsWarning ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsWarning && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsWarning}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Emails de Notificación *
                        </label>
                        <input
                          type="text"
                          name="stampsWarningNotification"
                          value={formData.stampsWarningNotification}
                          onChange={handleInputChange}
                          placeholder="email1@dominio.com; email2@dominio.com"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsWarningNotification
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsWarningNotification ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsWarningNotification && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsWarningNotification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Límites Críticos */}
                  <div className="space-y-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">Crítico</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Límite de Timbres *
                        </label>
                        <input
                          type="number"
                          name="stampsCritical"
                          value={formData.stampsCritical}
                          onChange={handleInputChange}
                          placeholder="130"
                          min="1"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsCritical
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsCritical ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsCritical && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsCritical}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Emails de Notificación *
                        </label>
                        <input
                          type="text"
                          name="stampsCriticalNotification"
                          value={formData.stampsCriticalNotification}
                          onChange={handleInputChange}
                          placeholder="email1@dominio.com; email2@dominio.com"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsCriticalNotification
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsCriticalNotification ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsCriticalNotification && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsCriticalNotification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Límites Fatales */}
                  <div className="space-y-4 mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200">Fatal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Límite de Timbres *
                        </label>
                        <input
                          type="number"
                          name="stampsFatal"
                          value={formData.stampsFatal}
                          onChange={handleInputChange}
                          placeholder="50"
                          min="1"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsFatal
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsFatal ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsFatal && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsFatal}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Emails de Notificación *
                        </label>
                        <input
                          type="text"
                          name="stampsFatalNotification"
                          value={formData.stampsFatalNotification}
                          onChange={handleInputChange}
                          placeholder="email1@dominio.com; email2@dominio.com"
                          disabled={isSubmitting}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsFatalNotification
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsFatalNotification ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        {errors.stampsFatalNotification && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.stampsFatalNotification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            
            {/* Mensajes de error del servidor */}
            {errors.server && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.server}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#2C2C38]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando Cliente...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Agregar Cliente
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}