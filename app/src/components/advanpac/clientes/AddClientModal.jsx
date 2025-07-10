'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X, Building, Plus, AlertCircle, Search, ChevronDown, Check, XCircle } from 'lucide-react';
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

  // Estados para cargar compañías
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    selectedCompany: null,
    customerIdentifier: '',
    name: '',
    stampsWarning: '',
    stampsWarningEmails: [],
    stampsWarningEmailInput: '',
    stampsCritical: '',
    stampsCriticalEmails: [],
    stampsCriticalEmailInput: '',
    stampsFatal: '',
    stampsFatalEmails: [],
    stampsFatalEmailInput: ''
  });

  // Estados para el selector de compañías
  const [companySearch, setCompanySearch] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const companyDropdownRef = useRef(null);

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar compañías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  // Función para cargar compañías desde la API
  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await fetch('/api/companies/advanpac/non-customer');
      const result = await response.json();
      
      if (result.statusCode === "200" && result.data) {
        const mappedCompanies = result.data.map(company => ({
          id: company.idCompany,
          idCompany: company.idCompany,
          companyIdentifier: company.companyIdentifier,
          name: company.name
        }));
        setCompanies(mappedCompanies);
        setFilteredCompanies(mappedCompanies);
      } else {
        console.error('Error al cargar compañías:', result.message);
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      console.error('Error al conectar con la API de compañías:', error);
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

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
        stampsWarningEmails: [],
        stampsWarningEmailInput: '',
        stampsCritical: '',
        stampsCriticalEmails: [],
        stampsCriticalEmailInput: '',
        stampsFatal: '',
        stampsFatalEmails: [],
        stampsFatalEmailInput: ''
      });
      setCompanySearch('');
      setIsCompanyDropdownOpen(false);
      setErrors({});
      setIsSubmitting(false);
      setCompanies([]);
      setFilteredCompanies([]);
    }
  }, [isOpen]);

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    return (
      formData.selectedCompany &&
      formData.stampsWarning.trim() &&
      formData.stampsWarningEmails.length > 0 &&
      formData.stampsCritical.trim() &&
      formData.stampsCriticalEmails.length > 0 &&
      formData.stampsFatal.trim() &&
      formData.stampsFatalEmails.length > 0
    );
  };

  // Limpiar formulario cuando se cierra el modal
  const resetForm = () => {
    setFormData({
      selectedCompany: null,
      customerIdentifier: '',
      name: '',
      stampsWarning: '',
      stampsWarningEmails: [],
      stampsWarningEmailInput: '',
      stampsCritical: '',
      stampsCriticalEmails: [],
      stampsCriticalEmailInput: '',
      stampsFatal: '',
      stampsFatalEmails: [],
      stampsFatalEmailInput: ''
    });
    setCompanySearch('');
    setErrors({});
    setIsSubmitting(false);
  };

  // Validar un solo email
  const validateSingleEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Agregar email a una categoría específica
  const addEmail = (category, email) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateSingleEmail(trimmedEmail)) {
      setErrors(prev => ({
        ...prev,
        [`${category}EmailInput`]: 'Formato de email inválido'
      }));
      return;
    }

    // Verificar si el email ya existe en esta categoría
    if (formData[`${category}Emails`].includes(trimmedEmail)) {
      setErrors(prev => ({
        ...prev,
        [`${category}EmailInput`]: 'Este email ya está agregado'
      }));
      return;
    }

    // Agregar el email y limpiar el input
    setFormData(prev => ({
      ...prev,
      [`${category}Emails`]: [...prev[`${category}Emails`], trimmedEmail],
      [`${category}EmailInput`]: ''
    }));

    // Limpiar errores
    setErrors(prev => ({
      ...prev,
      [`${category}EmailInput`]: undefined,
      [category]: undefined
    }));
  };

  // Remover email de una categoría específica
  const removeEmail = (category, emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      [`${category}Emails`]: prev[`${category}Emails`].filter(email => email !== emailToRemove)
    }));
  };

  // Manejar Enter en campos de email
  const handleEmailKeyPress = (e, category) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail(category, formData[`${category}EmailInput`]);
    }
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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

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

    if (formData.stampsWarningEmails.length === 0) {
      newErrors.stampsWarningEmails = 'Debe agregar al menos un email de advertencia';
    }

    if (formData.stampsCriticalEmails.length === 0) {
      newErrors.stampsCriticalEmails = 'Debe agregar al menos un email crítico';
    }

    if (formData.stampsFatalEmails.length === 0) {
      newErrors.stampsFatalEmails = 'Debe agregar al menos un email fatal';
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
      const submitData = {
        CustomerIdentifier: formData.customerIdentifier,
        Name: formData.name,
        StampsWarning: formData.stampsWarning.toString(),
        StampsWarningNotification: formData.stampsWarningEmails.join(';'),
        StampsCritical: formData.stampsCritical.toString(),
        StampsCriticalNotification: formData.stampsCriticalEmails.join(';'),
        StampsFatal: formData.stampsFatal.toString(),
        StampsFatalNotification: formData.stampsFatalEmails.join(';')
      };

      const response = await fetch('/api/companies/advanpac/customer/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        onSubmit({
          success: true,
          message: result.message || 'Cliente agregado exitosamente'
        });
        
        handleClose();
      } else {
        if (result.message) {
          if (result.message.toLowerCase().includes('identificador') || result.message.toLowerCase().includes('customer')) {
            setErrors(prev => ({
              ...prev,
              selectedCompany: result.message,
              server: result.message
            }));
          } else if (result.message.toLowerCase().includes('nombre') || result.message.toLowerCase().includes('name')) {
            setErrors(prev => ({
              ...prev,
              name: result.message,
              server: result.message
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              server: result.message
            }));
          }
        } else {
          setErrors(prev => ({
            ...prev,
            server: 'Error al procesar la solicitud'
          }));
        }
      }
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
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Agregar Cliente AdvanPAC
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
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

                {isCompanyDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingCompanies ? (
                      <div className="px-3 py-8 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                          Cargando compañías...
                        </div>
                      </div>
                    ) : filteredCompanies.length > 0 ? (
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
                        {companies.length === 0 && !isLoadingCompanies 
                          ? 'Error al cargar compañías'
                          : 'No se encontraron compañías'
                        }
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

            <div className="border-t border-gray-200 dark:border-[#2C2C38] pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configuración de Límites de Timbres
              </h3>
              
              {/* Límites de Advertencia */}
              <div className="space-y-4 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Advertencia</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4">
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
                  <div className="col-span-12 md:col-span-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emails de Notificación *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="stampsWarningEmailInput"
                          value={formData.stampsWarningEmailInput}
                          onChange={handleInputChange}
                          onKeyPress={(e) => handleEmailKeyPress(e, 'stampsWarning')}
                          placeholder="Agregar email y presionar Enter"
                          disabled={isSubmitting}
                          className={clsx(
                            "flex-1 min-w-0 px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsWarningEmailInput
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsWarningEmailInput ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        <button
                          type="button"
                          onClick={() => addEmail('stampsWarning', formData.stampsWarningEmailInput)}
                          disabled={isSubmitting || !formData.stampsWarningEmailInput.trim()}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {errors.stampsWarningEmailInput && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsWarningEmailInput}
                        </p>
                      )}
                      
                      {errors.stampsWarningEmails && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsWarningEmails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.stampsWarningEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 rounded-md min-h-[2.5rem]">
                    {formData.stampsWarningEmails.map((email, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail('stampsWarning', email)}
                          className="hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-full p-0.5 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Límites Críticos */}
              <div className="space-y-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">Crítico</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4">
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
                  <div className="col-span-12 md:col-span-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emails de Notificación *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="stampsCriticalEmailInput"
                          value={formData.stampsCriticalEmailInput}
                          onChange={handleInputChange}
                          onKeyPress={(e) => handleEmailKeyPress(e, 'stampsCritical')}
                          placeholder="Agregar email y presionar Enter"
                          disabled={isSubmitting}
                          className={clsx(
                            "flex-1 min-w-0 px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsCriticalEmailInput
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsCriticalEmailInput ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        <button
                          type="button"
                          onClick={() => addEmail('stampsCritical', formData.stampsCriticalEmailInput)}
                          disabled={isSubmitting || !formData.stampsCriticalEmailInput.trim()}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {errors.stampsCriticalEmailInput && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsCriticalEmailInput}
                        </p>
                      )}
                      
                      {errors.stampsCriticalEmails && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsCriticalEmails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.stampsCriticalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 rounded-md min-h-[2.5rem]">
                    {formData.stampsCriticalEmails.map((email, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-full"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail('stampsCritical', email)}
                          className="hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-full p-0.5 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Límites Fatales */}
              <div className="space-y-4 mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200">Fatal</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4">
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
                  <div className="col-span-12 md:col-span-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emails de Notificación *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="stampsFatalEmailInput"
                          value={formData.stampsFatalEmailInput}
                          onChange={handleInputChange}
                          onKeyPress={(e) => handleEmailKeyPress(e, 'stampsFatal')}
                          placeholder="Agregar email y presionar Enter"
                          disabled={isSubmitting}
                          className={clsx(
                            "flex-1 min-w-0 px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                            errors.stampsFatalEmailInput
                              ? "border-red-300 dark:border-red-500"
                              : "border-gray-300 dark:border-[#2C2C38]"
                          )}
                          style={!errors.stampsFatalEmailInput ? { '--tw-ring-color': primaryColor } : {}}
                        />
                        <button
                          type="button"
                          onClick={() => addEmail('stampsFatal', formData.stampsFatalEmailInput)}
                          disabled={isSubmitting || !formData.stampsFatalEmailInput.trim()}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {errors.stampsFatalEmailInput && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsFatalEmailInput}
                        </p>
                      )}
                      
                      {errors.stampsFatalEmails && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.stampsFatalEmails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.stampsFatalEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 rounded-md min-h-[2.5rem]">
                    {formData.stampsFatalEmails.map((email, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail('stampsFatal', email)}
                          className="hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full p-0.5 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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