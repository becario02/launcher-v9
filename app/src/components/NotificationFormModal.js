import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Building, Search, XCircle, RefreshCw, Video, FileText, HelpCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import clsx from 'clsx';
import axios from 'axios';

export default function NotificationFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  companies = []
}) {
  const { primaryColor } = usePrimaryColor();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'INFO',
    expirationDate: '',
    status: 'ACTIVE',
    companyIds: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el buscador de compañías
  const [companySearch, setCompanySearch] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [initialCompanyIds, setInitialCompanyIds] = useState([]);
  
  // Categorías disponibles
  const categories = [
    { value: 'SYSTEMUPDATE', label: 'Actualización del Sistema', icon: 'refresh' },
    { value: 'NEWVIDEO', label: 'Nuevo Video', icon: 'video' },
    { value: 'NEWARTICLE', label: 'Nuevo Artículo', icon: 'file-text' },
    { value: 'NA', label: 'Sin Categoría', icon: 'help-circle' }
  ];

  // Inicialización del formulario al abrir el modal
  useEffect(() => {
    console.log("Inicializando formulario con datos:", initialData);
    
    if (initialData) {
      // Formatear la fecha de expiración para el input date
      let formattedDate = '';
      if (initialData.expirationDate) {
        try {
          const date = new Date(initialData.expirationDate);
          formattedDate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error al formatear fecha:', e);
        }
      }

      // Obtener los IDs de compañías si es una edición
      let companyIds = [];
      if (initialData.companies) {
        companyIds = initialData.companies.map(c => c.idCompany);
      }

      // Guardar los IDs iniciales
      setInitialCompanyIds(companyIds);

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'INFO',
        expirationDate: formattedDate,
        status: initialData.status || 'ACTIVE',
        companyIds: companyIds
      });
    } else {
      // Resetear el formulario para creación
      setInitialCompanyIds([]);
      setFormData({
        title: '',
        description: '',
        category: 'SYSTEMUPDATE',
        expirationDate: '',
        status: 'ACTIVE',
        companyIds: []
      });
    }
    
    // Resetear el buscador y errores
    setCompanySearch('');
    setErrors({});
    // Ordenar las compañías - usando los IDs iniciales para el ordenamiento
    const ids = initialData?.companies?.map(c => c.idCompany) || [];
    setInitialCompanyIds(ids);
    setFilteredCompanies(getSortedCompanies(companies, ids));
  }, [initialData, isOpen, companies]);

  // Función para buscar compañías
  const searchCompanies = async (query) => {
    setIsLoadingCompanies(true);
    try {
      const response = await axios.get('http://localhost:5173/mslauncher/api/v1/companies', {
        params: { search: query },
        headers: {
          'Accept-Language': 'es'
        }
      });
      
      if (response.data && response.data.data) {
        // Ordenar las compañías para mostrar primero las inicialmente seleccionadas
        const orderedCompanies = getSortedCompanies(response.data.data, initialCompanyIds);
        setFilteredCompanies(orderedCompanies);
      }
    } catch (error) {
      console.error('Error al buscar compañías:', error);
      setFilteredCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  // Ordenar las compañías para mostrar primero las asignadas inicialmente
  const getSortedCompanies = (companies, initialSelectedIds) => {
    if (!companies || companies.length === 0) return [];
    
    // Crear una copia para no modificar el array original
    return [...companies].sort((a, b) => {
      // Solo consideramos los IDs que estaban seleccionados inicialmente
      // No las nuevas selecciones hechas por el usuario
      const aIsInitiallySelected = initialSelectedIds.includes(a.idCompany);
      const bIsInitiallySelected = initialSelectedIds.includes(b.idCompany);
      
      if (aIsInitiallySelected && !bIsInitiallySelected) return -1; // a va primero
      if (!aIsInitiallySelected && bIsInitiallySelected) return 1;  // b va primero
      
      // Si ambos están seleccionados o no seleccionados, ordenar por nombre
      return a.name.localeCompare(b.name);
    });
  };
  
  // Seleccionar o deseleccionar todas las compañías
  const toggleSelectAllCompanies = (selectAll) => {
    if (selectAll) {
      // Seleccionar todas las compañías visibles (filtradas)
      const allIds = filteredCompanies.map(company => company.idCompany);
      setFormData(prev => ({
        ...prev,
        companyIds: [...new Set([...prev.companyIds, ...allIds])] // Usar Set para evitar duplicados
      }));
    } else {
      // Mantener solo las compañías que no están visibles actualmente
      const filteredIds = filteredCompanies.map(company => company.idCompany);
      setFormData(prev => ({
        ...prev,
        companyIds: prev.companyIds.filter(id => !filteredIds.includes(id))
      }));
    }
    
    // Limpiar error si hay compañías seleccionadas
    if (errors.companyIds) {
      setErrors(prev => ({ ...prev, companyIds: null }));
    }
  };

  // Efecto para buscar compañías cuando cambia el término de búsqueda
  useEffect(() => {
    if (!companySearch.trim()) {
      // Ordenar las compañías para mostrar primero las inicialmente seleccionadas
      const orderedCompanies = getSortedCompanies(companies, initialCompanyIds);
      setFilteredCompanies(orderedCompanies);
      return;
    }
    
    const delayDebounce = setTimeout(() => {
      searchCompanies(companySearch);
    }, 300); // Debounce para evitar muchas llamadas al API
    
    return () => clearTimeout(delayDebounce);
  }, [companySearch, companies, initialCompanyIds]);

  // Al abrir el modal, inicializar las compañías filtradas
  useEffect(() => {
    if (isOpen) {
      // Ordenar las compañías para mostrar primero las inicialmente seleccionadas
      const orderedCompanies = getSortedCompanies(companies, initialCompanyIds);
      setFilteredCompanies(orderedCompanies);
    }
  }, [isOpen, companies, initialCompanyIds]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (!formData.expirationDate) {
      newErrors.expirationDate = 'La fecha de expiración es obligatoria';
    } else {
      // Verificar que la fecha no sea anterior a hoy
      const selectedDate = new Date(formData.expirationDate);
      const today = new Date();
      
      // Establecer la hora a 0 para comparar solo fechas
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expirationDate = 'La fecha de expiración no puede ser anterior a hoy';
      }
    }
    
    if (formData.companyIds.length === 0) {
      newErrors.companyIds = 'Debe seleccionar al menos una compañía';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCompanyChange = (e) => {
    const { value, checked } = e.target;
    const companyId = parseInt(value);
    
    setFormData(prev => {
      const updatedCompanyIds = checked
        ? [...prev.companyIds, companyId]
        : prev.companyIds.filter(id => id !== companyId);
      
      return { ...prev, companyIds: updatedCompanyIds };
    });
    
    // Limpiar error si selecciona al menos una compañía
    if (errors.companyIds) {
      setErrors(prev => ({ ...prev, companyIds: null }));
    }
  };

  // Manejar cambio en el input de búsqueda
  const handleCompanySearchChange = (e) => {
    setCompanySearch(e.target.value);
  };

  // Limpiar la búsqueda
  const clearCompanySearch = () => {
    setCompanySearch('');
    setFilteredCompanies(companies);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-xl bg-white dark:bg-[#1C1C24] text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-[#2C2C38]">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {initialData ? 'Editar Notificación' : 'Nueva Notificación'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Columna izquierda - Datos básicos */}
                    <div className="md:col-span-3 space-y-6">
                      {/* Título */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Título <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className={clsx(
                            "w-full px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-1",
                            errors.title 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500" 
                              : "border-gray-300 focus:border-primary focus:ring-primary dark:border-[#4a4c57] dark:focus:border-primary",
                            "bg-white dark:bg-[#262631] text-gray-800 dark:text-white"
                          )}
                          placeholder="Ingresa el título de la notificación"
                        />
                        {errors.title && (
                          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                        )}
                      </div>

                      {/* Descripción */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={5}
                          value={formData.description}
                          onChange={handleChange}
                          className={clsx(
                            "w-full px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-1",
                            errors.description 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500" 
                              : "border-gray-300 focus:border-primary focus:ring-primary dark:border-[#4a4c57] dark:focus:border-primary",
                            "bg-white dark:bg-[#262631] text-gray-800 dark:text-white"
                          )}
                          placeholder="Ingresa la descripción detallada de la notificación"
                        />
                        {errors.description && (
                          <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                        )}
                      </div>

                      {/* Fila con categoría y fecha */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Categoría */}
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Categoría <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              {formData.category === 'SYSTEMUPDATE' && <RefreshCw className="h-4 w-4 text-gray-400" />}
                              {formData.category === 'NEWVIDEO' && <Video className="h-4 w-4 text-gray-400" />}
                              {formData.category === 'NEWARTICLE' && <FileText className="h-4 w-4 text-gray-400" />}
                              {formData.category === 'NA' && <HelpCircle className="h-4 w-4 text-gray-400" />}
                            </div>
                            <select
                              id="category"
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              className="w-full pl-10 px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-[#4a4c57] dark:focus:border-primary dark:bg-[#262631] dark:text-white"
                            >
                              {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Fecha de Expiración */}
                        <div>
                          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha de Expiración <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              id="expirationDate"
                              name="expirationDate"
                              value={formData.expirationDate}
                              onChange={handleChange}
                              min={new Date().toISOString().split('T')[0]} // Esto permite seleccionar el día actual
                              className={clsx(
                                "w-full pl-10 px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-1",
                                errors.expirationDate 
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500" 
                                  : "border-gray-300 focus:border-primary focus:ring-primary dark:border-[#4a4c57] dark:focus:border-primary",
                                "bg-white dark:bg-[#262631] text-gray-800 dark:text-white"
                              )}
                            />
                          </div>
                          {errors.expirationDate && (
                            <p className="mt-1 text-xs text-red-500">{errors.expirationDate}</p>
                          )}
                        </div>
                      </div>

                      {/* Estado (solo para edición) */}
                      {initialData && (
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estado
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-[#4a4c57] dark:focus:border-primary dark:bg-[#262631] dark:text-white"
                          >
                            <option value="ACTIVE">Activa</option>
                            <option value="INACTIVE">Inactiva</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha - Selección de compañías */}
                    <div className="md:col-span-2">
                      <div className="h-full flex flex-col">
                        {/* Título de la sección */}
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Compañías <span className="text-red-500">*</span>
                          </label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.companyIds.length} seleccionadas
                          </span>
                        </div>
                        
                        {errors.companyIds && (
                          <p className="mt-1 text-xs text-red-500 mb-2">{errors.companyIds}</p>
                        )}
                        
                        {/* Buscador de compañías */}
                        <div className="relative mb-2">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Buscar compañía por nombre..."
                            value={companySearch}
                            onChange={handleCompanySearchChange}
                            className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-[#4a4c57] dark:bg-[#262631] dark:text-white"
                          />
                          
                          {companySearch && (
                            <button
                              type="button"
                              onClick={clearCompanySearch}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                            </button>
                          )}
                        </div>
                        
                        {/* Contenedor de lista de compañías con altura fija */}
                        <div className="flex-1 overflow-hidden border border-gray-200 dark:border-[#4a4c57] rounded-md bg-gray-50 dark:bg-[#262631] flex flex-col max-h-[340px]">
                          {isLoadingCompanies ? (
                            <div className="flex justify-center items-center py-4 flex-1">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : filteredCompanies.length === 0 ? (
                            <div className="flex justify-center items-center py-4 flex-1">
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                {companySearch 
                                  ? 'No se encontraron compañías con ese nombre' 
                                  : 'No hay compañías disponibles'}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col h-full">
                              {/* Opción para seleccionar/deseleccionar todas */}
                              <div className="sticky top-0 p-3 bg-gray-50 dark:bg-[#262631] border-b border-gray-200 dark:border-gray-700 z-10">
                                <div 
                                  className={clsx(
                                    "flex items-center p-2 rounded-md transition-colors",
                                    filteredCompanies.length > 0 && filteredCompanies.every(c => formData.companyIds.includes(c.idCompany)) 
                                      ? "bg-primary/15 dark:bg-primary/25 border border-primary/20 dark:border-[#4a4c57]" 
                                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    id="select-all-companies"
                                    checked={filteredCompanies.length > 0 && filteredCompanies.every(c => formData.companyIds.includes(c.idCompany))}
                                    onChange={(e) => toggleSelectAllCompanies(e.target.checked)}
                                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 dark:focus:ring-primary"
                                  />
                                  <label
                                    htmlFor="select-all-companies"
                                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer w-full"
                                  >
                                    {filteredCompanies.length > 0 && filteredCompanies.every(c => formData.companyIds.includes(c.idCompany))
                                      ? 'Deseleccionar todas'
                                      : 'Seleccionar todas'}
                                  </label>
                                </div>
                              </div>
                              
                              {/* Lista de compañías con scroll */}
                              <div className="p-3 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                  {filteredCompanies.map(company => (
                                    <div 
                                      key={company.idCompany} 
                                      className={clsx(
                                        "flex items-start p-2 rounded-md transition-colors",
                                        formData.companyIds.includes(company.idCompany) 
                                          ? "bg-primary/15 dark:bg-primary/25 border border-primary/20 dark:border-[#4a4c57]" 
                                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                                      )}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`company-${company.idCompany}`}
                                        value={company.idCompany}
                                        checked={formData.companyIds.includes(company.idCompany)}
                                        onChange={handleCompanyChange}
                                        className="h-4 w-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 dark:focus:ring-primary"
                                      />
                                      <label
                                        htmlFor={`company-${company.idCompany}`}
                                        className="ml-2 w-full cursor-pointer"
                                      >
                                        <div className="flex items-center gap-1">
                                          <Building className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                          <span className={clsx(
                                            "text-sm",
                                            formData.companyIds.includes(company.idCompany) 
                                              ? "text-primary-600 dark:text-primary-400 font-medium" 
                                              : "text-gray-800 dark:text-gray-200"
                                          )}>
                                            {company.name}
                                          </span>
                                        </div>
                                        {company.alias && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-6 block mt-0.5">
                                            {company.alias}
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción al final del formulario */}
                  <div className="mt-8 pt-4 border-t border-gray-200 dark:border-[#2C2C38] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-[#2C2C38] dark:bg-[#262631] dark:text-gray-300 dark:hover:bg-[#2C2C38]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white dark:focus:ring-offset-[#1C1C24] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : initialData ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}