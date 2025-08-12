'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTokenManager } from '@/hooks/useTokenManager';
import Toast from '@/components/Toast';

const DiotTaxCatalog = () => {
  const { primaryColor } = usePrimaryColor();
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();

  // States
  const [taxData, setTaxData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);

  // Transform API data to table rows
  const createTableRows = useCallback((taxes) => {
    if (!taxes) return [];
    
    return [
      { 
        key: 'ctaContableIva0',
        concepto: 'IVA TASA 0%', 
        cuentaContable: taxes.ctaContableIva0 || '' 
      },
      { 
        key: 'ctaContableIvaExcento',
        concepto: 'IVA EXENTO', 
        cuentaContable: taxes.ctaContableIvaExcento || '' 
      },
      { 
        key: 'ctaContableIsr10',
        concepto: 'RETENCIÓN ISR', 
        cuentaContable: taxes.ctaContableIsr10 || '' 
      },
      { 
        key: 'ctaContableRetIva10',
        concepto: 'RETENCIÓN IVA 10.66%', 
        cuentaContable: taxes.ctaContableRetIva10 || '' 
      },
      { 
        key: 'ctaContableRetIva4',
        concepto: 'RETENCIÓN IVA 4%', 
        cuentaContable: taxes.ctaContableRetIva4 || '' 
      },
      { 
        key: 'ctaContableIva16',
        concepto: 'IVA 16%', 
        cuentaContable: taxes.ctaContableIva16 || '' 
      },
      { 
        key: 'ctaContableIva8',
        concepto: 'IVA ESTÍMULO FRONTERIZO', 
        cuentaContable: taxes.ctaContableIva8 || '' 
      }
    ];
  }, []);

  // Fetch tax data
  const fetchTaxes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/getTaxes', {
        method: 'GET'
      });
      
      if (result.statusCode === '200' && result.data && result.data.length > 0) {
        const taxes = result.data[0];
        setTaxData(taxes);
        
        // Initialize edited data
        const initialEditedData = {};
        Object.keys(taxes).forEach(key => {
          initialEditedData[key] = taxes[key] || '';
        });
        setEditedData(initialEditedData);
        
        console.log('Tax data loaded successfully');
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching tax data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tokenizedRequest, tokenError, clearTokenError]);

  // Handle input change
  const handleInputChange = useCallback((key, value) => {
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Check if there are changes
    if (taxData) {
      const hasAnyChanges = Object.keys(taxData).some(k => 
        (editedData[k] !== undefined ? editedData[k] : taxData[k]) !== taxData[k] || 
        (k === key && value !== taxData[k])
      );
      setHasChanges(hasAnyChanges);
    }
  }, [taxData, editedData]);

  // Save changes
  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      clearTokenError();

      const result = await tokenizedRequest('/mserpservice/api/diot/v1/updateTaxes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });
      
      if (result.statusCode === '200') {
        // Update original data with saved changes
        setTaxData({ ...editedData });
        setHasChanges(false);
        
        // Show success toast
        setToast({
          message: 'Cambios guardados exitosamente',
          type: 'success'
        });
        
        console.log('Tax data saved successfully:', result.message);
      } else {
        throw new Error(result.message || 'Error al guardar los cambios');
      }
      
    } catch (err) {
      console.error('Error saving tax data:', err);
      const errorMessage = tokenError || err.message;
      setError(errorMessage);
      
      // Show error toast
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  }, [editedData, tokenizedRequest, tokenError, clearTokenError]);

  // Reset changes
  const resetChanges = useCallback(() => {
    if (taxData) {
      const resetData = {};
      Object.keys(taxData).forEach(key => {
        resetData[key] = taxData[key] || '';
      });
      setEditedData(resetData);
      setHasChanges(false);
    }
  }, [taxData]);

  // Load data on mount
  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  // Get table rows
  const tableRows = createTableRows(editedData);

  if (isLoading && !taxData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-gray-600 dark:text-gray-400">Cargando catálogo de impuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Catálogo de Impuestos DIOT
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
          Configuración de cuentas contables para los diferentes tipos de impuestos del DIOT.
        </p>
      </div>

      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error || tokenError}</span>
          </div>
        </div>
      )}

      {/* Token Processing Banner */}
      {isProcessingTokens && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Procesando tokens de acceso...</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={fetchTaxes}
          disabled={isLoading || isProcessingTokens}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>

        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={resetChanges}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Descartar cambios
            </button>
          )}
          
          <button
            onClick={saveChanges}
            disabled={!hasChanges || isSaving || isProcessingTokens}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: hasChanges ? primaryColor : '#9CA3AF' }}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#2C2C38] border-b border-gray-200 dark:border-[#3C3C48]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cuenta Contable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2C2C38]">
              {tableRows.map((row, index) => (
                <tr 
                  key={row.key}
                  className="hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {row.concepto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <input
                      type="text"
                      value={editedData[row.key] || ''}
                      onChange={(e) => handleInputChange(row.key, e.target.value)}
                      disabled={isLoading || isSaving || isProcessingTokens}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ '--tw-ring-color': primaryColor }}
                      placeholder="Ingrese la cuenta contable"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {tableRows.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay datos de impuestos disponibles</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Las cuentas contables pueden contener múltiples valores separados por comas</li>
              <li>Asegúrese de que las cuentas contables existan en el catálogo de cuentas</li>
              <li>Los cambios se aplicarán inmediatamente al generar el DIOT</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DiotTaxCatalog;