'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Calculator, FileText, Download, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTokenManager } from '@/hooks/useTokenManager';
import Toast from '@/components/Toast';
import { exportDiotToExcel } from '@/utils/diot/DiotExcelExport';
import { exportDiotToTxt } from '@/utils/diot/DiotTxtExport';

const DiotGenerarPage = () => {
  const { primaryColor } = usePrimaryColor();
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // State management
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [diotData, setDiotData] = useState([]);
  const [proporcion, setProporcion] = useState(100);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingRecordId, setSavingRecordId] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingTxt, setIsExportingTxt] = useState(false);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast(null);
  };

  // Format period for API (date only, no time)
  const formatPeriodForApi = (periodo) => {
    const date = new Date(periodo);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Format period for display
  const formatPeriodDisplay = (periodo) => {
    const date = new Date(periodo);
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get activity type label
  const getActivityTypeLabel = (tipo) => {
    const types = {
      1: 'Actividades Zona Norte',
      2: 'Actividades Zona Sur',
      3: 'General 16%',
      4: 'Importación tangibles',
      5: 'Importación intangibles'
    };
    return types[tipo] || `Tipo ${tipo}`;
  };

  // Get accreditation type label
  const getAccreditationTypeLabel = (tipo) => {
    const types = {
      1: 'Ingresos Acreditable al 100%',
      2: 'Ingresos Se aplica proporción',
      3: 'Ingresos No cumple con requisitos',
      4: 'Ingresos Exentos',
      5: 'Ingresos No objeto'
    };
    return types[tipo] || `Tipo ${tipo}`;
  };

  // Fetch available periods
  const fetchPeriods = useCallback(async () => {
    try {
      setIsLoadingPeriods(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/getPeriods', {
        method: 'GET'
      });

      if (result.statusCode === '200' && result.data) {
        setPeriods(result.data);
        // Auto-select the most recent period
        if (result.data.length > 0) {
          setSelectedPeriod(result.data[0].periodo);
        }
      } else {
        throw new Error(result.message || 'Error al obtener períodos');
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError(tokenError || err.message);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, [tokenizedRequest, tokenError, clearTokenError]);

  // Fetch DIOT data for selected period
  const fetchDiotData = useCallback(async (periodo) => {
    if (!periodo) return;

    try {
      setIsLoadingData(true);
      setError(null);
      clearTokenError();

      const formattedPeriod = formatPeriodForApi(periodo);
      const result = await tokenizedRequest(`/mserpservice/api/diot/v1/getDiotBase?periodo=${formattedPeriod}`, {
        method: 'GET'
      });

      if (result.statusCode === '200' && result.data) {
        setDiotData(result.data);
      } else {
        throw new Error(result.message || 'Error al obtener datos DIOT');
      }
    } catch (err) {
      console.error('Error fetching DIOT data:', err);
      setError(tokenError || err.message);
      setDiotData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [tokenizedRequest, tokenError, clearTokenError]);

  // Calculate DIOT base
  const handleCalculateDiot = async () => {
    if (!selectedPeriod) {
      setError('Debe seleccionar un período');
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);
      clearTokenError();

      const requestBody = {
        usuario: 'SA', // This could be dynamic based on user context
        periodo: formatPeriodForApi(selectedPeriod),
        tipo: 0,
        proporcion: proporcion / 100 // Convert percentage to decimal
      };

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/calculateDiot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (result.statusCode === '200') {
        // Refresh data after calculation
        await fetchDiotData(selectedPeriod);
        showToast('Base DIOT calculada exitosamente', 'success');
      } else {
        throw new Error(result.message || 'Error al calcular DIOT');
      }
    } catch (err) {
      console.error('Error calculating DIOT:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
      showToast(`Error al calcular DIOT: ${errorMessage}`, 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    if (newPeriod) {
      fetchDiotData(newPeriod);
    }
  };

  // Handle proportion change
  const handleProporcionChange = (e) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    setProporcion(value);
  };

  // Handle activity type change for a record
  const handleActivityChange = (recordIndex, newValue) => {
    const updatedData = [...diotData];
    updatedData[recordIndex].actoActividad = newValue === '' ? null : parseInt(newValue);
    setDiotData(updatedData);
  };

  // Handle accreditation type change for a record
  const handleAccreditationChange = (recordIndex, newValue) => {
    const updatedData = [...diotData];
    updatedData[recordIndex].tipoAcreditamiento = newValue === '' ? null : parseInt(newValue);
    setDiotData(updatedData);
  };

  // Save individual record changes
  const saveRecordChanges = async (record) => {
    try {
      setSavingRecordId(record.idDiot);
      setError(null);
      clearTokenError();

      // Validate required fields
      if (!record.actoActividad || !record.tipoAcreditamiento) {
        throw new Error('Debe seleccionar Acto/Actividad y Tipo de Acreditamiento');
      }

      const requestBody = {
        IdDiot: record.idDiot,
        ActoActividad: record.actoActividad,
        TipoAcreditamiento: record.tipoAcreditamiento
      };

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/updateDiotBaseRow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (result.statusCode === '200') {
        showToast(`Registro ${record.idDiot} guardado exitosamente`, 'success');
      } else {
        throw new Error(result.message || 'Error al guardar el registro');
      }
    } catch (err) {
      console.error('Error saving record:', err);
      const errorMessage = tokenError || err.message;
      setError(`Error al guardar registro ${record.idDiot}: ${errorMessage}`);
      showToast(`Error al guardar registro ${record.idDiot}: ${errorMessage}`, 'error');
    } finally {
      setSavingRecordId(null);
    }
  };

  // Save all modified records
  const saveAllChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      clearTokenError();

      // Filter records that have both fields selected
      const recordsToSave = diotData.filter(record => 
        record.actoActividad && record.tipoAcreditamiento
      );

      if (recordsToSave.length === 0) {
        throw new Error('No hay registros con cambios para guardar');
      }

      // Save each record individually
      let savedCount = 0;
      let errorCount = 0;

      for (const record of recordsToSave) {
        try {
          await saveRecordChanges(record);
          savedCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (savedCount > 0) {
        showToast(`${savedCount} registro${savedCount > 1 ? 's' : ''} guardado${savedCount > 1 ? 's' : ''} exitosamente`, 'success');
      }
      
      if (errorCount > 0) {
        showToast(`${errorCount} registro${errorCount > 1 ? 's' : ''} no pudo${errorCount > 1 ? 'n' : ''} ser guardado${errorCount > 1 ? 's' : ''}`, 'error');
      }
    } catch (err) {
      console.error('Error saving all changes:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    if (!selectedPeriod) {
      showToast('Debe seleccionar un período para exportar', 'error');
      return;
    }

    try {
      setIsExporting(true);
      const result = await exportDiotToExcel(tokenizedRequest, selectedPeriod, showToast);
      
      if (result.success) {
        console.log(`Excel exported successfully: ${result.detalleRecords} detalle records, ${result.consolidadoRecords} consolidado records`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      // Error toast is already handled in exportDiotToExcel
    } finally {
      setIsExporting(false);
    }
  };

  // Handle TXT export
  const handleTxtExport = async () => {
    if (!selectedPeriod) {
      showToast('Debe seleccionar un período para exportar', 'error');
      return;
    }

    try {
      setIsExportingTxt(true);
      const result = await exportDiotToTxt(tokenizedRequest, selectedPeriod, showToast);
      
      if (result.success) {
        console.log(`TXT exported successfully: ${result.recordsCount} records`);
      }
    } catch (err) {
      console.error('TXT export failed:', err);
      // Error toast is already handled in exportDiotToTxt
    } finally {
      setIsExportingTxt(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Fetch data when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchDiotData(selectedPeriod);
    }
  }, [selectedPeriod, fetchDiotData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Base DIOT 2025
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
          Generación y administración de la Declaración Informativa de Operaciones con Terceros.
        </p>
      </div>

      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error || tokenError}</span>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Período:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              disabled={isLoadingPeriods || isProcessingTokens}
              className="px-3 py-1.5 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': primaryColor }}
            >
              <option value="">Seleccionar período</option>
              {periods.map((period) => (
                <option key={period.periodo} value={period.periodo}>
                  {period.nomPer}
                </option>
              ))}
            </select>
            {isLoadingPeriods && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculateDiot}
            disabled={!selectedPeriod || isCalculating || isProcessingTokens}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            {isCalculating ? 'Calculando...' : 'Calcular base DIOT'}
          </button>

          {/* Generate DIOT Button (Disabled) */}
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            Generar DIOT 2025
          </button>

          {/* Proportion Input */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aplica proporción:
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={proporcion}
                onChange={handleProporcionChange}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-1"
                style={{ '--tw-ring-color': primaryColor }}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2C2C38]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registros DIOT
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isLoadingData ? 'Cargando...' : `${diotData.length} registros`}
              </span>
              {isLoadingData && (
                <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2C2C38]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proceso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Póliza
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ref. Documento
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conciliado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha Conciliado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base 1
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base 2
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base Exento
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base 0
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tasa IVA
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto IVA 1
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto IVA 2
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IVA Retenido 1
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IVA Retenido 2
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acto/Actividad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo Acreditamiento
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1C1C24] divide-y divide-gray-200 dark:divide-[#2C2C38]">
              {isLoadingData ? (
                <tr>
                  <td colSpan="20" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                      <span className="text-gray-500 dark:text-gray-400">Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              ) : diotData.length === 0 ? (
                <tr>
                  <td colSpan="20" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {selectedPeriod ? 'No hay registros para el período seleccionado' : 'Seleccione un período para ver los datos'}
                  </td>
                </tr>
              ) : (
                diotData.map((record, index) => (
                  <tr key={record.idDiot || index} className="hover:bg-gray-50 dark:hover:bg-[#2C2C38]/50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">
                      {record.rfc}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate" title={record.nombre}>
                      {record.nombre || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      {record.proceso || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      {record.poliza || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      {record.refDocumento1 || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        record.conciliado === 1 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {record.conciliado === 1 ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      {record.fechaConciliado ? formatPeriodDisplay(record.fechaConciliado) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.base1 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.base2 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.baseExento || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.base0 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {(record.tasaIva || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.montoIva1 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.montoIva2 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.ivaRetenido1 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.ivaRetenido2 || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white text-right font-mono">
                      {formatCurrency(record.importe)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      <select
                        value={record.actoActividad || ''}
                        onChange={(e) => handleActivityChange(index, e.target.value)}
                        disabled={savingRecordId === record.idDiot}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed w-full min-w-48"
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Seleccionar...</option>
                        {[1, 2, 3, 4, 5].map(tipo => (
                          <option key={tipo} value={tipo}>
                            {`${tipo} - ${getActivityTypeLabel(tipo)}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                      <select
                        value={record.tipoAcreditamiento || ''}
                        onChange={(e) => handleAccreditationChange(index, e.target.value)}
                        disabled={savingRecordId === record.idDiot}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-[#2C2C38] rounded bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed w-full min-w-48"
                        style={{ '--tw-ring-color': primaryColor }}
                      >
                        <option value="">Seleccionar...</option>
                        {[1, 2, 3, 4, 5].map(tipo => (
                          <option key={tipo} value={tipo}>
                            {`${tipo} - ${getAccreditationTypeLabel(tipo)}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Actions Column */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => saveRecordChanges(record)}
                        disabled={!record.actoActividad || !record.tipoAcreditamiento || savingRecordId === record.idDiot || isSaving}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-white rounded text-xs hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                        style={{ backgroundColor: primaryColor }}
                        title="Guardar este registro"
                      >
                        {savingRecordId === record.idDiot ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        {savingRecordId === record.idDiot ? 'Guardando...' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={saveAllChanges}
                disabled={isSaving || isLoadingData || diotData.filter(r => r.actoActividad && r.tipoAcreditamiento).length === 0}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Todos'}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExcelExport}
                disabled={!selectedPeriod || isExporting || isLoadingData}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting ? 'Exportando...' : 'Exportar Excel'}
              </button>
              <button
                onClick={handleTxtExport}
                disabled={!selectedPeriod || isExportingTxt || isLoadingData}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {isExportingTxt ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isExportingTxt ? 'Exportando...' : 'Exportar TXT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default DiotGenerarPage;