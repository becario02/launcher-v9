'use client';

import { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import { decryptAES } from '@/utils/aesDecrypt';

export default function IntegratorFormModal({ isOpen, onClose, onSubmit }) {
  const USERNAME = process.env.NEXT_PUBLIC_MSERPSERVICE_USERNAME;
  const PASSWORD = process.env.NEXT_PUBLIC_MSERPSERVICE_PASSWORD;

  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estado para los integradores desde la API
  const [integradores, setIntegradores] = useState([]);
  const [loadingIntegradores, setLoadingIntegradores] = useState(false);

  // Estado para los clientes desde la API
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Estado para los convenios desde la API
  const [convenios, setConvenios] = useState([]);
  const [loadingConvenios, setLoadingConvenios] = useState(false);

  // Estado para remitentes y destinatarios desde la API
  const [remitentes, setRemitentes] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [loadingRemitentes, setLoadingRemitentes] = useState(false);
  const [loadingDestinatarios, setLoadingDestinatarios] = useState(false);

  // Estado para las terminales desde la API
  const [terminales, setTerminales] = useState([]);
  const [loadingTerminales, setLoadingTerminales] = useState(false);

  // Estado para las compañías desde la API
  const [companias, setCompanias] = useState([]);
  const [loadingCompanias, setLoadingCompanias] = useState(false);

  // Estados para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    integrador: '',
    descripcion: '',
    cliente: '',
    convenio: '',
    remitente: '',
    destinatario: '',
    compania: '',
    terminal: '',
    fechaOS: '',
    ruta: '',
    archivo: null
  });

  const [dragActive, setDragActive] = useState(false);

  // Función helper para obtener configuración de empresa
  const getCompanyConfig = () => {
    try {
      const selectedCompany = localStorage.getItem('selectedCompany');
      if (!selectedCompany) {
        throw new Error('No se encontró selectedCompany en localStorage');
      }

      const companyData = JSON.parse(selectedCompany);
      
      if (!companyData.urlErp) {
        throw new Error('No se encontró urlErp en selectedCompany');
      }

      // Usar desencriptación AES en lugar de base64
      const encryptedPassword = companyData.passwordErpDb;
      const decodedPassword = decryptAES(encryptedPassword);

      return {
        urlErp: companyData.urlErp,
        serverErpDb: companyData.serverErpDb,
        nameErpDb: companyData.nameErpDb,
        userErpDb: companyData.userErpDb,
        passwordErpDb: decodedPassword
      };
    } catch (error) {
      console.error('Error getting company config:', error);
      throw error;
    }
  };

  // Cargar integradores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchIntegradores();
      loginAndFetchClientes();
    }
  }, [isOpen]);

  // Cargar remitentes y destinatarios cuando tengamos el token
  useEffect(() => {
    if (accessToken && isOpen) {
      fetchRemitentesDestinatarios();
      fetchTerminales();
    }
  }, [accessToken, isOpen]);

  const fetchIntegradores = async () => {
    setLoadingIntegradores(true);
    try {
      const response = await fetch('/api/integrator', {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setIntegradores(result.data);
        }
      } else {
        console.error('Error al cargar integradores:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
    } finally {
      setLoadingIntegradores(false);
    }
  };

  const loginAndFetchClientes = async () => {
    setLoadingClientes(true);
    try {
      const companyConfig = getCompanyConfig();

      // Primero hacer login
      const loginResponse = await fetch(`${companyConfig.urlErp}/mserpservice/api/auth/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: USERNAME,
          password: PASSWORD
        })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        const token = loginResult.accessToken;
        setAccessToken(token);
        
        // Luego obtener clientes con el token y headers de DB
        const clientesResponse = await fetch(`${companyConfig.urlErp}/mserpservice/api/v1/getCustomers`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept-Language': 'es-MX',
            'Server-Erp-Db': companyConfig.serverErpDb,
            'Name-Erp-Db': companyConfig.nameErpDb,
            'User-Erp-Db': companyConfig.userErpDb,
            'Password-Erp-Db': companyConfig.passwordErpDb
          }
        });

        if (clientesResponse.ok) {
          const clientesResult = await clientesResponse.json();
          if (clientesResult.statusCode === "200" && clientesResult.data) {
            // Ordenar clientes alfabéticamente por nombre
            const clientesOrdenados = clientesResult.data.sort((a, b) => 
              a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
            );
            setClientes(clientesOrdenados);
          }
        } else {
          console.error('Error al cargar clientes:', clientesResponse.statusText);
        }
      } else {
        console.error('Error en login:', loginResponse.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con la API de clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia el integrador, actualizar la descripción automáticamente
    if (name === 'integrador') {
      const selectedIntegrador = integradores.find(i => i.idIntegrator === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        descripcion: selectedIntegrador ? selectedIntegrador.description : '',
        archivo: null, // Limpiar archivo seleccionado al cambiar integrador
        compania: '' // Limpiar compañía seleccionada
      }));
      
      // Cargar compañías del integrador seleccionado
      if (value) {
        fetchCompanias(value);
      } else {
        setCompanias([]); // Limpiar compañías si no hay integrador
      }
    } 
    // Si se cambia el cliente, cargar convenios y limpiar campos dependientes
    else if (name === 'cliente') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        convenio: '', // Limpiar convenio seleccionado
        ruta: '', // Limpiar ruta
        remitente: '', // Limpiar remitente
        destinatario: '' // Limpiar destinatario
      }));
      
      // Cargar convenios del cliente seleccionado
      if (value) {
        const selectedCliente = clientes.find(c => c.id === parseInt(value));
        if (selectedCliente) {
          fetchConvenios(selectedCliente.nombre);
        }
      } else {
        setConvenios([]); // Limpiar convenios si no hay cliente
      }
    }
    // Si se cambia el convenio, actualizar la ruta automáticamente
    else if (name === 'convenio') {
      const selectedConvenio = convenios.find(c => c.convenio === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ruta: selectedConvenio ? selectedConvenio.idruta : ''
      }));
    } 
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const fetchConvenios = async (clienteNombre) => {
    if (!accessToken) return;
    
    setLoadingConvenios(true);
    try {
      const companyConfig = getCompanyConfig();

      const response = await fetch(`${companyConfig.urlErp}/mserpservice/api/v1/getConvenios/${clienteNombre}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept-Language': 'es-MX',
          'Server-Erp-Db': companyConfig.serverErpDb,
          'Name-Erp-Db': companyConfig.nameErpDb,
          'User-Erp-Db': companyConfig.userErpDb,
          'Password-Erp-Db': companyConfig.passwordErpDb
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          setConvenios(result.data);
        }
      } else {
        console.error('Error al cargar convenios:', response.statusText);
        setConvenios([]);
      }
    } catch (error) {
      console.error('Error al conectar con la API de convenios:', error);
      setConvenios([]);
    } finally {
      setLoadingConvenios(false);
    }
  };

  const fetchRemitentesDestinatarios = async () => {
    if (!accessToken) {
      // Si no tenemos token, intentar obtenerlo primero
      setTimeout(() => {
        if (accessToken) {
          fetchRemitentesDestinatarios();
        }
      }, 1000);
      return;
    }

    setLoadingRemitentes(true);
    setLoadingDestinatarios(true);

    try {
      const companyConfig = getCompanyConfig();

      // Cargar remitentes (domTipo = 1)
      const remitentesResponse = await fetch(`${companyConfig.urlErp}/mserpservice/api/v1/getRemitentesDestin/1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept-Language': 'es-MX',
          'Server-Erp-Db': companyConfig.serverErpDb,
          'Name-Erp-Db': companyConfig.nameErpDb,
          'User-Erp-Db': companyConfig.userErpDb,
          'Password-Erp-Db': companyConfig.passwordErpDb
        }
      });

      if (remitentesResponse.ok) {
        const remitentesResult = await remitentesResponse.json();
        if (remitentesResult.statusCode === "200" && remitentesResult.data) {
          // Ordenar remitentes alfabéticamente por nombre
          const remitentesOrdenados = remitentesResult.data.sort((a, b) => 
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          );
          setRemitentes(remitentesOrdenados);
        }
      } else {
        console.error('Error al cargar remitentes:', remitentesResponse.statusText);
      }

      // Cargar destinatarios (domTipo = 2)
      const destinatariosResponse = await fetch(`${companyConfig.urlErp}/mserpservice/api/v1/getRemitentesDestin/2`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept-Language': 'es-MX',
          'Server-Erp-Db': companyConfig.serverErpDb,
          'Name-Erp-Db': companyConfig.nameErpDb,
          'User-Erp-Db': companyConfig.userErpDb,
          'Password-Erp-Db': companyConfig.passwordErpDb
        }
      });

      if (destinatariosResponse.ok) {
        const destinatariosResult = await destinatariosResponse.json();
        if (destinatariosResult.statusCode === "200" && destinatariosResult.data) {
          // Ordenar destinatarios alfabéticamente por nombre
          const destinatariosOrdenados = destinatariosResult.data.sort((a, b) => 
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          );
          setDestinatarios(destinatariosOrdenados);
        }
      } else {
        console.error('Error al cargar destinatarios:', destinatariosResponse.statusText);
      }

    } catch (error) {
      console.error('Error al conectar con la API de remitentes/destinatarios:', error);
    } finally {
      setLoadingRemitentes(false);
      setLoadingDestinatarios(false);
    }
  };

  const fetchTerminales = async () => {
    if (!accessToken) return;

    setLoadingTerminales(true);
    try {
      const companyConfig = getCompanyConfig();

      const response = await fetch(`${companyConfig.urlErp}/mserpservice/api/terminales/all`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
          'Accept-Language': 'es-MX',
          'Server-Erp-Db': companyConfig.serverErpDb,
          'Name-Erp-Db': companyConfig.nameErpDb,
          'User-Erp-Db': companyConfig.userErpDb,
          'Password-Erp-Db': companyConfig.passwordErpDb
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data && Array.isArray(result.data)) {
          // Filtrar terminales activas y ordenar por terminalClave
          const terminalesActivas = result.data
            .filter(terminal => terminal.banInactiva === 0)
            .sort((a, b) => a.terminalClave.localeCompare(b.terminalClave));
          setTerminales(terminalesActivas);
        }
      } else {
        console.error('Error al cargar terminales:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con la API de terminales:', error);
    } finally {
      setLoadingTerminales(false);
    }
  };

  const fetchCompanias = async (integradorId) => {
    setLoadingCompanias(true);
    try {
      const response = await fetch(`/api/integrator/companies?idIntegrator=${integradorId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          // Ordenar compañías alfabéticamente por nombre
          const companiasOrdenadas = result.data.sort((a, b) => 
            a.companyName.localeCompare(b.companyName, 'es', { sensitivity: 'base' })
          );
          setCompanias(companiasOrdenadas);
        }
      } else {
        console.error('Error al cargar compañías:', response.statusText);
        setCompanias([]);
      }
    } catch (error) {
      console.error('Error al conectar con la API de compañías:', error);
      setCompanias([]);
    } finally {
      setLoadingCompanias(false);
    }
  };

  // Obtener el convenio seleccionado
  const selectedIntegrador = integradores.find(i => i.idIntegrator === parseInt(formData.integrador));
  const selectedConvenio = convenios.find(c => c.convenio === parseInt(formData.convenio));
  
  // Generar el accept para el input de archivo
  const getAcceptedFileTypes = () => {
    if (!selectedIntegrador || !selectedIntegrador.uploadFileTypes) {
      return '';
    }
    
    // Convertir "txt, xml" a ".txt,.xml"
    return selectedIntegrador.uploadFileTypes
      .split(',')
      .map(type => `.${type.trim()}`)
      .join(',');
  };

  // Validar si el archivo es del tipo correcto
  const isValidFileType = (file) => {
    if (!selectedIntegrador || !selectedIntegrador.uploadFileTypes) {
      return false;
    }
    
    const allowedTypes = selectedIntegrador.uploadFileTypes
      .split(',')
      .map(type => type.trim().toLowerCase());
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isValidFileType(file)) {
        setFormData(prev => ({
          ...prev,
          archivo: file
        }));
      } else {
        alert(`El archivo seleccionado no es válido. Tipos permitidos: ${selectedIntegrador?.uploadFileTypes || 'ninguno'}`);
        e.target.value = ''; // Limpiar el input
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setFormData(prev => ({
          ...prev,
          archivo: file
        }));
      } else {
        alert(`El archivo seleccionado no es válido. Tipos permitidos: ${selectedIntegrador?.uploadFileTypes || 'ninguno'}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitSuccess(false);

    try {
      const companyConfig = getCompanyConfig();

      // Crear FormData para el upload
      const uploadData = new FormData();

      // Convertir fecha a formato ISO
      const fechaISO = new Date(formData.fechaOS).toISOString();

      // Agregar todos los campos al FormData
      uploadData.append('FechaOS', fechaISO);
      uploadData.append('IdRemitente', formData.remitente);
      uploadData.append('IdUserUpload', '1'); // Asumiendo usuario 1, esto podría venir de contexto
      uploadData.append('TerminalClave', formData.terminal);
      uploadData.append('IdRuta', formData.ruta);
      uploadData.append('IdDestinatario', formData.destinatario);
      uploadData.append('IdCustomerIntegrator', formData.compania);
      uploadData.append('UrlErp', companyConfig.urlErp);
      uploadData.append('File', formData.archivo);
      uploadData.append('IdConvenio', formData.convenio);
      uploadData.append('IdCliente', formData.cliente);

      // Agregar credenciales de la base de datos
      uploadData.append('DbIp', companyConfig.serverErpDb);
      uploadData.append('DbName', companyConfig.nameErpDb);
      uploadData.append('DbUser', companyConfig.userErpDb);
      uploadData.append('DbPassword', companyConfig.passwordErpDb);

      // Enviar al endpoint
      const response = await fetch('/api/integrator/upload', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`
        },
        body: uploadData // FormData con el archivo y credenciales
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        setSubmitSuccess(true);
        setSubmitMessage(`¡Éxito! ${result.message}. Folio generado: ${result.data.folio}`);

        // Llamar al callback del padre si existe
        if (onSubmit) {
          onSubmit({
            success: true,
            data: result.data,
            message: result.message
          });
        }

        // No cerrar automáticamente, dejar que el usuario lo haga manualmente

      } else {
        // Error del servidor o validación
        setSubmitSuccess(false);
        setSubmitMessage(result.message || 'Error desconocido en el servidor');
      }

    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setSubmitSuccess(false);
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      integrador: '',
      descripcion: '',
      cliente: '',
      convenio: '',
      remitente: '',
      destinatario: '',
      compania: '',
      terminal: '',
      fechaOS: '',
      ruta: '',
      archivo: null
    });
    setSubmitMessage(null);
    setSubmitSuccess(false);
  };

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
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuración del Integrador
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Mensaje de resultado */}
        {submitMessage && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border ${
            submitSuccess 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {submitSuccess ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                {submitSuccess ? (
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {submitMessage}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error al procesar el archivo:
                    </p>
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-3 max-h-40 overflow-y-auto custom-scrollbar">
                      <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                        {submitMessage.replace(/^Error:\s*/, '')}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
          {/* Primera fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Integrador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Integrador
              </label>
              <select
                name="integrador"
                value={formData.integrador}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingIntegradores || isSubmitting}
              >
                <option value="">
                  {loadingIntegradores ? 'Cargando integradores...' : 'Seleccionar integrador'}
                </option>
                {integradores.map(integrador => (
                  <option key={integrador.idIntegrator} value={integrador.idIntegrator}>
                    {integrador.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente
              </label>
              <select
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingClientes || isSubmitting}
              >
                <option value="">
                  {loadingClientes ? 'Cargando clientes...' : 'Seleccionar cliente'}
                </option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              readOnly
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-gray-50 dark:bg-[#0F0F14] text-gray-900 dark:text-white cursor-not-allowed"
              placeholder="La descripción se llenará automáticamente al seleccionar un integrador"
            />
          </div>

          {/* Segunda fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Convenio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Convenio
              </label>
              <select
                name="convenio"
                value={formData.convenio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingConvenios || !formData.cliente || isSubmitting}
              >
                <option value="">
                  {!formData.cliente 
                    ? 'Selecciona un cliente primero' 
                    : loadingConvenios 
                    ? 'Cargando convenios...' 
                    : 'Seleccionar convenio'
                  }
                </option>
                {convenios.map(convenio => (
                  <option key={convenio.convenio} value={convenio.convenio}>
                    {convenio.convenio} - {convenio.ruta}
                  </option>
                ))}
              </select>
              {formData.cliente && convenios.length === 0 && !loadingConvenios && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No se encontraron convenios para este cliente
                </p>
              )}
            </div>

            {/* Compañía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compañía
              </label>
              <select
                name="compania"
                value={formData.compania}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingCompanias || !formData.integrador || isSubmitting}
              >
                <option value="">
                  {!formData.integrador 
                    ? 'Selecciona un integrador primero' 
                    : loadingCompanias 
                    ? 'Cargando compañías...' 
                    : 'Seleccionar compañía'
                  }
                </option>
                {companias.map(compania => (
                  <option key={compania.idCustomerIntegrator} value={compania.idCustomerIntegrator}>
                    {compania.companyName}
                  </option>
                ))}
              </select>
              {formData.integrador && companias.length === 0 && !loadingCompanias && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No se encontraron compañías para este integrador
                </p>
              )}
            </div>
          </div>

          {/* Tercera fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Remitente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remitente
              </label>
              <select
                name="remitente"
                value={formData.remitente}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingRemitentes || isSubmitting}
              >
                <option value="">
                  {loadingRemitentes ? 'Cargando remitentes...' : 'Seleccionar remitente'}
                </option>
                {remitentes.map(remitente => (
                  <option key={remitente.id} value={remitente.id}>
                    {remitente.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Destinatario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destinatario
              </label>
              <select
                name="destinatario"
                value={formData.destinatario}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingDestinatarios || isSubmitting}
              >
                <option value="">
                  {loadingDestinatarios ? 'Cargando destinatarios...' : 'Seleccionar destinatario'}
                </option>
                {destinatarios.map(destinatario => (
                  <option key={destinatario.id} value={destinatario.id}>
                    {destinatario.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuarta fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Terminal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Terminal
              </label>
              <select
                name="terminal"
                value={formData.terminal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={loadingTerminales || isSubmitting}
              >
                <option value="">
                  {loadingTerminales ? 'Cargando terminales...' : 'Seleccionar terminal'}
                </option>
                {terminales.map(terminal => (
                  <option key={terminal.terminalClave} value={terminal.terminalClave}>
                    {terminal.terminalClave} - {terminal.terminalNombre.trim()}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha OS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha OS
              </label>
              <input
                type="date"
                name="fechaOS"
                value={formData.fechaOS}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Ruta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ruta
            </label>
            <input
              type="text"
              name="ruta"
              value={selectedConvenio ? selectedConvenio.ruta : ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-gray-50 dark:bg-[#0F0F14] text-gray-900 dark:text-white cursor-not-allowed"
              placeholder="La ruta se llenará automáticamente al seleccionar un convenio"
            />
            {/* Campo oculto para almacenar el ID de la ruta */}
            <input type="hidden" name="rutaId" value={formData.ruta} />
          </div>

          {/* Selección de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccione el archivo
              {selectedIntegrador && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  (Tipos permitidos: {selectedIntegrador.uploadFileTypes})
                </span>
              )}
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-[#2C2C38] hover:border-gray-400 dark:hover:border-gray-500'
              } ${!selectedIntegrador || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragEnter={selectedIntegrador && !isSubmitting ? handleDrag : undefined}
              onDragLeave={selectedIntegrador && !isSubmitting ? handleDrag : undefined}
              onDragOver={selectedIntegrador && !isSubmitting ? handleDrag : undefined}
              onDrop={selectedIntegrador && !isSubmitting ? handleDrop : undefined}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept={getAcceptedFileTypes()}
                disabled={!selectedIntegrador || isSubmitting}
                required
              />
              <div className="space-y-2">
                {formData.archivo ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.archivo.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedIntegrador && !isSubmitting ? (
                          <>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              Haz clic para subir
                            </span>{' '}
                            o arrastra y suelta
                          </>
                        ) : (
                          isSubmitting ? 'Procesando archivo...' : 'Selecciona un integrador primero'
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {selectedIntegrador 
                          ? `${selectedIntegrador.uploadFileTypes.toUpperCase()} hasta 10MB`
                          : 'Tipos de archivo disponibles según el integrador'
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
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
              disabled={isSubmitting || !formData.archivo || submitSuccess}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {submitSuccess ? 'Archivo Procesado' : isSubmitting ? 'Procesando Archivo...' : 'Procesar Archivo'}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}