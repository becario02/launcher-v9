// utils/DiotExcelExport.js

import * as XLSX from 'xlsx';

/**
 * Format period for API (date only, no time)
 */
const formatPeriodForApi = (periodo) => {
  const date = new Date(periodo);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Format period for display
 */
const formatPeriodDisplay = (periodo) => {
  const date = new Date(periodo);
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return `${months[date.getMonth()]}-${date.getFullYear()}`;
};

/**
 * Format period for filename (MM_YYYY)
 */
const formatPeriodForFilename = (periodo) => {
  const date = new Date(periodo);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 01-12
  const year = date.getFullYear();
  return `${month}_${year}`;
};

/**
 * Fetch empresa RFC
 */
const fetchEmpresaRfc = async (tokenizedRequest) => {
  const result = await tokenizedRequest('/mserpservice/api/diot/v1/getEmpresaRfc', {
    method: 'GET'
  });

  if (result.statusCode === '200' && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || 'Error al obtener RFC de la empresa');
  }
};

/**
 * Format currency values
 */
const formatCurrencyValue = (amount) => {
  return typeof amount === 'number' ? amount : 0;
};

/**
 * Format date for Excel
 */
const formatDateForExcel = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX');
};

/**
 * Fetch DIOT Detalle data
 */
const fetchDiotDetalle = async (tokenizedRequest, periodo) => {
  const formattedPeriod = formatPeriodForApi(periodo);
  const result = await tokenizedRequest(`/mserpservice/api/diot/v1/getDiotDetalle?periodo=${formattedPeriod}`, {
    method: 'GET'
  });

  if (result.statusCode === '200' && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || 'Error al obtener datos de DIOT Detalle');
  }
};

/**
 * Fetch DIOT Consolidado data
 */
const fetchDiotConsolidado = async (tokenizedRequest) => {
  const result = await tokenizedRequest('/mserpservice/api/diot/v1/getDiotConsolidado', {
    method: 'GET'
  });

  if (result.statusCode === '200' && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || 'Error al obtener datos de DIOT Consolidado');
  }
};

/**
 * Create DIOT Detalle worksheet
 */
const createDetalleWorksheet = (detalleData) => {
  // Define headers for DIOT Detalle
  const headers = [
    'Proceso',
    'Módulo Origen',
    'Fecha',
    'Asiento',
    'Período',
    'Tipo Póliza',
    'Forma Afecta',
    'Ref. Documento 1',
    'Ref. Documento 2',
    'Conciliado',
    'Fecha Conciliado',
    'Consec. Multiple',
    'Folio Caja',
    'Consecutivo Caja',
    'ID Comprobante Caja',
    'ID Proveedor',
    'Tipo Proveedor',
    'Tipo Operación',
    'RFC',
    'Concepto Desc',
    'Asiento CxP',
    'Período CxP',
    'Monto Pago CxP Paq',
    'Ref CxP Paq',
    'Monto Local CxP',
    'Monto Base CxP',
    'Base 1',
    'Base 2',
    'Base 0',
    'Base Exento',
    'Tasa IVA',
    'Monto IVA 1',
    'Monto IVA 2',
    'IVA Retenido 1',
    'IVA Retenido 2',
    'Acto Actividad',
    'Tipo Acreditamiento',
    'Valact Val Fn',
    'Valact Dev Fn',
    'Valact Val Fs',
    'Valact Dev Fs',
    'Valact Val 16',
    'Valact Dev 16',
    'Valact Val Imptan 16',
    'Valact Dev Imptan 16',
    'Valact Val Impint 16',
    'Valact Dev Impint 16',
    'IVA Acred Excl Fn',
    'IVA Acred Prop Fn',
    'IVA Acred Excl Fs',
    'IVA Acred Prop Fs',
    'IVA Acred Excl 16',
    'IVA Acred Prop 16',
    'IVA Acred Excl Imptan 16',
    'IVA Acred Prop Imptan 16',
    'IVA Acred Excl Impint 16',
    'IVA Acred Prop Impint 16',
    'IVA No Acred Prop Fn',
    'IVA No Acred No Req Fn',
    'IVA No Acred Exent Fn',
    'IVA No Acred No Obj Fn',
    'IVA No Acred Prop Fs',
    'IVA No Acred No Req Fs',
    'IVA No Acred Exent Fs',
    'IVA No Acred No Obj Fs',
    'IVA No Acred Prop 16',
    'IVA No Acred No Req 16',
    'IVA No Acred Exent 16',
    'IVA No Acred No Obj 16',
    'IVA No Acred Prop Imptan 16',
    'IVA No Acred No Req Imptan 16',
    'IVA No Acred Exent Imptan 16',
    'IVA No Acred No Obj Imptan 16',
    'IVA No Acred Prop Impint 16',
    'IVA No Acred No Req Impint 16',
    'IVA No Acred Exent Impint 16',
    'IVA No Acred No Obj Impint 16',
    'DA IVA Ret Contrib',
    'DA Imp Exent IVA',
    'DA Exent IVA',
    'DA Otros 0 IVA',
    'DA No Obj IVA Nac',
    'DA No Obj IVA Sin Est',
    'DA Efectos Fiscales Comp',
    'Factor Pago'
  ];

  // Transform data to match headers
  const excelData = detalleData.map(record => [
    record.proceso || '',
    record.moduloOrigen || '',
    formatDateForExcel(record.fecha),
    record.asiento || '',
    formatPeriodDisplay(record.periodo),
    record.tipoPoliza || '',
    record.formaAfecta || '',
    record.refDocumento1 || '',
    record.refDocumento2 || '',
    record.conciliado === 1 ? 'Sí' : 'No',
    formatDateForExcel(record.fechaConciliado),
    record.consecMultiple || '',
    record.folioCaja || '',
    record.consecutivoCaja || '',
    record.idComprobanteCaja || '',
    record.idProveedor || '',
    record.tipoProveedor || '',
    record.tipoOperacion || '',
    record.rfc || '',
    record.conceptoDesc || '',
    record.asientoCxp || '',
    formatPeriodDisplay(record.periodoCxp),
    formatCurrencyValue(record.montoPagoCxpPaq),
    record.refCxpPaq || '',
    formatCurrencyValue(record.montoLocalCxp),
    formatCurrencyValue(record.montoBaseCxp),
    formatCurrencyValue(record.base1),
    formatCurrencyValue(record.base2),
    formatCurrencyValue(record.base0),
    formatCurrencyValue(record.baseExento),
    formatCurrencyValue(record.tasaIva),
    formatCurrencyValue(record.montoIva1),
    formatCurrencyValue(record.montoIva2),
    formatCurrencyValue(record.ivaRetenido1),
    formatCurrencyValue(record.ivaRetenido2),
    record.actoActividad || '',
    record.tipoAcreditamiento || '',
    formatCurrencyValue(record.valactValFn),
    formatCurrencyValue(record.valactDevFn),
    formatCurrencyValue(record.valactValFs),
    formatCurrencyValue(record.valactDevFs),
    formatCurrencyValue(record.valactVal16),
    formatCurrencyValue(record.valactDev16),
    formatCurrencyValue(record.valactValImptan16),
    formatCurrencyValue(record.valactDevImptan16),
    formatCurrencyValue(record.valactValImpint16),
    formatCurrencyValue(record.valactDevImpint16),
    formatCurrencyValue(record.ivaacredExclFn),
    formatCurrencyValue(record.ivaacredPropFn),
    formatCurrencyValue(record.ivaacredExclFs),
    formatCurrencyValue(record.ivaacredPropFs),
    formatCurrencyValue(record.ivaacredExcl16),
    formatCurrencyValue(record.ivaacredProp16),
    formatCurrencyValue(record.ivaacredExclImptan16),
    formatCurrencyValue(record.ivaacredPropImptan16),
    formatCurrencyValue(record.ivaacredExclImpint16),
    formatCurrencyValue(record.ivaacredPropImpint16),
    formatCurrencyValue(record.ivanoacredPropFn),
    formatCurrencyValue(record.ivanoacredNoreqFn),
    formatCurrencyValue(record.ivanoacredExentFn),
    formatCurrencyValue(record.ivanoacredNoobjFn),
    formatCurrencyValue(record.ivanoacredPropFs),
    formatCurrencyValue(record.ivanoacredNoreqFs),
    formatCurrencyValue(record.ivanoacredExentFs),
    formatCurrencyValue(record.ivanoacredNoobjFs),
    formatCurrencyValue(record.ivanoacredProp16),
    formatCurrencyValue(record.ivanoacredNoreq16),
    formatCurrencyValue(record.ivanoacredExent16),
    formatCurrencyValue(record.ivanoacredNoobj16),
    formatCurrencyValue(record.ivanoacredPropImptan16),
    formatCurrencyValue(record.ivanoacredNoreqImptan16),
    formatCurrencyValue(record.ivanoacredExentImptan16),
    formatCurrencyValue(record.ivanoacredNoobjImptan16),
    formatCurrencyValue(record.ivanoacredPropImpint16),
    formatCurrencyValue(record.ivanoacredNoreqImpint16),
    formatCurrencyValue(record.ivanoacredExentImpint16),
    formatCurrencyValue(record.ivanoacredNoobjImpint16),
    formatCurrencyValue(record.daIvaRetContrib),
    formatCurrencyValue(record.daImpExentIva),
    formatCurrencyValue(record.daExentIva),
    formatCurrencyValue(record.daOtros0Iva),
    formatCurrencyValue(record.daNoobjIvaNac),
    formatCurrencyValue(record.daNoobjIvaSinEst),
    record.daEfectosFiscalesComp ? 'Sí' : 'No',
    formatCurrencyValue(record.factorPago)
  ]);

  // Create worksheet with headers and data
  const wsData = [headers, ...excelData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const columnWidths = headers.map(() => ({ wch: 15 }));
  ws['!cols'] = columnWidths;

  return ws;
};

/**
 * Create DIOT Consolidado worksheet
 */
const createConsolidadoWorksheet = (consolidadoData) => {
  // Define headers for DIOT Consolidado
  const headers = [
    'Tipo Tercero',
    'Tipo Operación',
    'RFC',
    'Número Identificación Fiscal',
    'Cliente Nombre',
    'Código País',
    'Jurisdicción',
    'Valact Val Fn',
    'Valact Dev Fn',
    'Valact Val Fs',
    'Valact Dev Fs',
    'Valact Val 16',
    'Valact Dev 16',
    'Valact Val Imptan 16',
    'Valact Dev Imptan 16',
    'Valact Val Impint 16',
    'Valact Dev Impint 16',
    'IVA Acred Excl Fn',
    'IVA Acred Prop Fn',
    'IVA Acred Excl Fs',
    'IVA Acred Prop Fs',
    'IVA Acred Excl 16',
    'IVA Acred Prop 16',
    'IVA Acred Excl Imptan 16',
    'IVA Acred Prop Imptan 16',
    'IVA Acred Excl Impint 16',
    'IVA Acred Prop Impint 16',
    'IVA No Acred Prop Fn',
    'IVA No Acred No Req Fn',
    'IVA No Acred Exent Fn',
    'IVA No Acred No Obj Fn',
    'IVA No Acred Prop Fs',
    'IVA No Acred No Req Fs',
    'IVA No Acred Exent Fs',
    'IVA No Acred No Obj Fs',
    'IVA No Acred Prop 16',
    'IVA No Acred No Req 16',
    'IVA No Acred Exent 16',
    'IVA No Acred No Obj 16',
    'IVA No Acred Prop Imptan 16',
    'IVA No Acred No Req Imptan 16',
    'IVA No Acred Exent Imptan 16',
    'IVA No Acred No Obj Imptan 16',
    'IVA No Acred Prop Impint 16',
    'IVA No Acred No Req Impint 16',
    'IVA No Acred Exent Impint 16',
    'IVA No Acred No Obj Impint 16',
    'DA IVA Ret Contrib',
    'DA Imp Exent IVA',
    'DA Exent IVA',
    'DA Otros 0 IVA',
    'DA No Obj IVA Nac',
    'DA No Obj IVA Sin Est',
    'DA Efectos Fiscales Comp'
  ];

  // Transform data to match headers
  const excelData = consolidadoData.map(record => [
    record.tipoTercero || '',
    record.tipoOperacion || '',
    record.rfc || '',
    record.numeroIdentificacionFiscal || '',
    record.clienteNombre || '',
    record.codigoPais || '',
    record.juridiccion || '',
    formatCurrencyValue(record.valactValFn),
    formatCurrencyValue(record.valactDevFn),
    formatCurrencyValue(record.valactValFs),
    formatCurrencyValue(record.valactDevFs),
    formatCurrencyValue(record.valactVal16),
    formatCurrencyValue(record.valactDev16),
    formatCurrencyValue(record.valactValImptan16),
    formatCurrencyValue(record.valactDevImptan16),
    formatCurrencyValue(record.valactValImpint16),
    formatCurrencyValue(record.valactDevImpint16),
    formatCurrencyValue(record.ivaacredExclFn),
    formatCurrencyValue(record.ivaacredPropFn),
    formatCurrencyValue(record.ivaacredExclFs),
    formatCurrencyValue(record.ivaacredPropFs),
    formatCurrencyValue(record.ivaacredExcl16),
    formatCurrencyValue(record.ivaacredProp16),
    formatCurrencyValue(record.ivaacredExclImptan16),
    formatCurrencyValue(record.ivaacredPropImptan16),
    formatCurrencyValue(record.ivaacredExclImpint16),
    formatCurrencyValue(record.ivaacredPropImpint16),
    formatCurrencyValue(record.ivanoacredPropFn),
    formatCurrencyValue(record.ivanoacredNoreqFn),
    formatCurrencyValue(record.ivanoacredExentFn),
    formatCurrencyValue(record.ivanoacredNoobjFn),
    formatCurrencyValue(record.ivanoacredPropFs),
    formatCurrencyValue(record.ivanoacredNoreqFs),
    formatCurrencyValue(record.ivanoacredExentFs),
    formatCurrencyValue(record.ivanoacredNoobjFs),
    formatCurrencyValue(record.ivanoacredProp16),
    formatCurrencyValue(record.ivanoacredNoreq16),
    formatCurrencyValue(record.ivanoacredExent16),
    formatCurrencyValue(record.ivanoacredNoobj16),
    formatCurrencyValue(record.ivanoacredPropImptan16),
    formatCurrencyValue(record.ivanoacredNoreqImptan16),
    formatCurrencyValue(record.ivanoacredExentImptan16),
    formatCurrencyValue(record.ivanoacredNoobjImptan16),
    formatCurrencyValue(record.ivanoacredPropImpint16),
    formatCurrencyValue(record.ivanoacredNoreqImpint16),
    formatCurrencyValue(record.ivanoacredExentImpint16),
    formatCurrencyValue(record.ivanoacredNoobjImpint16),
    formatCurrencyValue(record.daIvaRetContrib),
    formatCurrencyValue(record.daImpExentIva),
    formatCurrencyValue(record.daExentIva),
    formatCurrencyValue(record.daOtros0Iva),
    formatCurrencyValue(record.daNoobjIvaNac),
    formatCurrencyValue(record.daNoobjIvaSinEst),
    record.daEfectosFiscalesComp ? 'Sí' : 'No'
  ]);

  // Create worksheet with headers and data
  const wsData = [headers, ...excelData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const columnWidths = headers.map(() => ({ wch: 15 }));
  ws['!cols'] = columnWidths;

  return ws;
};

/**
 * Main export function
 */
export const exportDiotToExcel = async (tokenizedRequest, selectedPeriod, showToast) => {
  try {
    // Fetch empresa RFC and both datasets
    const [empresaRfc, detalleData, consolidadoData] = await Promise.all([
      fetchEmpresaRfc(tokenizedRequest),
      fetchDiotDetalle(tokenizedRequest, selectedPeriod),
      fetchDiotConsolidado(tokenizedRequest)
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheets
    const wsDetalle = createDetalleWorksheet(detalleData);
    const wsConsolidado = createConsolidadoWorksheet(consolidadoData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'DIOT Detalle');
    XLSX.utils.book_append_sheet(wb, wsConsolidado, 'DIOT Consolidado');

    // Generate filename with new format: RFC_EMPRESA_MM_YYYY_DIOT.xlsx
    const periodFormatted = formatPeriodForFilename(selectedPeriod);
    const filename = `${empresaRfc}_${periodFormatted}_DIOT.xlsx`;

    // Write and download file
    XLSX.writeFile(wb, filename);

    showToast(`Archivo Excel exportado:\n${filename}`, 'success');
    
    return {
      success: true,
      filename,
      detalleRecords: detalleData.length,
      consolidadoRecords: consolidadoData.length
    };

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    const errorMessage = error.message || 'Error al exportar a Excel';
    showToast(`Error en exportación: ${errorMessage}`, 'error');
    
    throw new Error(errorMessage);
  }
};