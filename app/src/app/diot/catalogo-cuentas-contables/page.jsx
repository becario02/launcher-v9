'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { useTokenManager } from '@/hooks/useTokenManager';
import { usePrimaryColor } from '@/context/primaryColor';

const DiotCatalogoCuentasContables = () => {
  const { primaryColor } = usePrimaryColor();
  const { tokenizedRequest, isProcessingTokens, tokenError } = useTokenManager();

  // State management
  const [taxAccounts, setTaxAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered data based on search term
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return taxAccounts;
    
    const searchLower = searchTerm.toLowerCase();
    return taxAccounts.filter(account => 
      account.ctaContable.toLowerCase().includes(searchLower) ||
      account.ctaContableDescrip.toLowerCase().includes(searchLower)
    );
  }, [taxAccounts, searchTerm]);

  // Fetch taxes first, then tax accounts
  const fetchTaxAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the taxes to build the request payload
      const taxesResult = await tokenizedRequest('/mserpservice/api/diot/v1/getTaxes', {
        method: 'GET'
      });

      if (taxesResult.statusCode !== '200' || !taxesResult.data || !taxesResult.data[0]) {
        throw new Error('Error al obtener configuración de impuestos');
      }

      const taxConfig = taxesResult.data[0];
      
      // Build taxes array from the tax configuration
      const taxes = [];
      if (taxConfig.ctaContableIva0) taxes.push(taxConfig.ctaContableIva0);
      if (taxConfig.ctaContableIvaExcento) taxes.push(taxConfig.ctaContableIvaExcento);
      if (taxConfig.ctaContableIsr10) taxes.push(taxConfig.ctaContableIsr10);
      if (taxConfig.ctaContableRetIva10) taxes.push(taxConfig.ctaContableRetIva10);
      if (taxConfig.ctaContableRetIva4) taxes.push(taxConfig.ctaContableRetIva4);
      if (taxConfig.ctaContableIva16) taxes.push(taxConfig.ctaContableIva16);
      if (taxConfig.ctaContableIva8) taxes.push(taxConfig.ctaContableIva8);

      // Filter out empty values
      const validTaxes = taxes.filter(tax => tax && tax.trim());

      if (validTaxes.length === 0) {
        throw new Error('No se encontraron cuentas contables configuradas');
      }

      // Now get the tax accounts
      const accountsResult = await tokenizedRequest('/mserpservice/api/diot/v1/getTaxAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taxes: validTaxes
        })
      });

      if (accountsResult.statusCode !== '200') {
        throw new Error(accountsResult.message || 'Error al obtener cuentas contables');
      }

      // Convert numeric tipoAcreditamiento to string values for display
      const processedAccounts = (accountsResult.data || []).map(account => ({
        ...account,
        tipoAcreditamiento: account.tipoAcreditamiento === "1" || account.tipoAcreditamiento === 1 ? 'Ingresos Acreditable al 100%' :
                           account.tipoAcreditamiento === "2" || account.tipoAcreditamiento === 2 ? 'Ingresos Se aplica proporción' :
                           account.tipoAcreditamiento === "3" || account.tipoAcreditamiento === 3 ? 'Ingresos No cumple con requisitos' :
                           account.tipoAcreditamiento === "4" || account.tipoAcreditamiento === 4 ? 'Ingresos Exentos' :
                           account.tipoAcreditamiento === "5" || account.tipoAcreditamiento === 5 ? 'Ingresos No objeto' : null
      }));

      setTaxAccounts(processedAccounts);
    } catch (err) {
      console.error('Error fetching tax accounts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account edit
  const handleEditAccount = (account) => {
    setEditingAccount({
      ...account,
      originalTipoAcreditamiento: account.tipoAcreditamiento
    });
  };

  // Handle save account changes
  const handleSaveAccount = async () => {
    if (!editingAccount) return;

    try {
      setIsSaving(true);
      setError(null);
      
      // Convert tipoAcreditamiento to number for API
      let tipoAcreditamientoValue = null;
      if (editingAccount.tipoAcreditamiento === 'Ingresos Acreditable al 100%') {
        tipoAcreditamientoValue = 1;
      } else if (editingAccount.tipoAcreditamiento === 'Ingresos Se aplica proporción') {
        tipoAcreditamientoValue = 2;
      } else if (editingAccount.tipoAcreditamiento === 'Ingresos No cumple con requisitos') {
        tipoAcreditamientoValue = 3;
      } else if (editingAccount.tipoAcreditamiento === 'Ingresos Exentos') {
        tipoAcreditamientoValue = 4;
      } else if (editingAccount.tipoAcreditamiento === 'Ingresos No objeto') {
        tipoAcreditamientoValue = 5;
      }

      // Only send the request if there's a valid value to update
      if (tipoAcreditamientoValue === null) {
        throw new Error('Debe seleccionar un tipo de acreditamiento válido');
      }

      // Call the update API
      const result = await tokenizedRequest('/mserpservice/api/diot/v1/updateTaxAccount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ctaContable: editingAccount.ctaContable,
          tipoAcreditamiento: tipoAcreditamientoValue
        })
      });

      if (result.statusCode !== '200') {
        throw new Error(result.message || 'Error al actualizar la cuenta contable');
      }

      // Update local state on successful save
      setTaxAccounts(prev => 
        prev.map(account => 
          account.ctaContable === editingAccount.ctaContable 
            ? { 
                ...account,
                tipoAcreditamiento: editingAccount.tipoAcreditamiento
              }
            : account
        )
      );
      
      setEditingAccount(null);
      
      // Optional: Show success message
      console.log('Cuenta contable actualizada exitosamente');
      
    } catch (err) {
      console.error('Error saving account:', err);
      setError(`Error al guardar los cambios: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAccount(null);
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    fetchTaxAccounts();
  };

  // Load data on component mount
  useEffect(() => {
    fetchTaxAccounts();
  }, []);

  // Get account type badge styles
  const getTypeStyle = (tipo, subtipo) => {
    if (tipo === 'Balance' && subtipo === 'Activo') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (tipo === 'Balance' && subtipo === 'Pasivo') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    } else if (tipo === 'Gasto') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Catálogo de Cuentas Contables
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
          Gestión del catálogo de cuentas contables para DIOT 2025.
        </p>
      </div>

      {/* Error Banner */}
      {(error || tokenError) && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error || tokenError}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading || isProcessingTokens}
              className="text-sm bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoading || isProcessingTokens) ? 'Cargando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cuenta o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ '--tw-ring-color': primaryColor }}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTaxAccounts}
              disabled={isLoading || isProcessingTokens}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || isProcessingTokens) ? 'animate-spin' : ''}`} />
              <span>{(isLoading || isProcessingTokens) ? 'Cargando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredAccounts.length} de {taxAccounts.length} cuentas contables
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-lg overflow-hidden">
        {isLoading && taxAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Cargando cuentas contables...</p>
            </div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchTerm ? 'No se encontraron cuentas contables' : 'No hay cuentas contables disponibles'}
              </p>
              {searchTerm && (
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#2C2C38]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cuenta Contable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subtipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo Acreditamiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1C1C24] divide-y divide-gray-200 dark:divide-[#2C2C38]">
                {filteredAccounts.map((account) => {
                  const isEditing = editingAccount?.ctaContable === account.ctaContable;
                  
                  return (
                    <tr key={account.ctaContable} className="hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {account.ctaContable}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {account.ctaContableDescrip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(account.tipo, account.subtipo)}`}>
                          {account.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {account.subtipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={editingAccount.tipoAcreditamiento || ''}
                            onChange={(e) => setEditingAccount(prev => ({
                              ...prev,
                              tipoAcreditamiento: e.target.value || null
                            }))}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            style={{ '--tw-ring-color': primaryColor }}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Ingresos Acreditable al 100%">Ingresos Acreditable al 100%</option>
                            <option value="Ingresos Se aplica proporción">Ingresos Se aplica proporción</option>
                            <option value="Ingresos No cumple con requisitos">Ingresos No cumple con requisitos</option>
                            <option value="Ingresos Exentos">Ingresos Exentos</option>
                            <option value="Ingresos No objeto">Ingresos No objeto</option>
                          </select>
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {account.tipoAcreditamiento || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSaveAccount}
                              disabled={isSaving}
                              className="px-3 py-1 text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-[#2C2C38] rounded-md hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditAccount(account)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiotCatalogoCuentasContables;