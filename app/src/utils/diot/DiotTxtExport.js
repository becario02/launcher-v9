// utils/DiotTxtExport.js

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
 * Format numeric values for TXT (ensure proper decimal format)
 */
const formatNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  if (typeof value === 'number') return value.toString();
  return value.toString();
};

/**
 * Format boolean values for TXT
 */
const formatBooleanValue = (value) => {
  if (value === true || value === 1 || value === '1') return 'true';
  if (value === false || value === 0 || value === '0') return 'false';
  return value ? 'true' : 'false';
};

/**
 * Escape pipe characters in text fields
 */
const escapePipeCharacters = (text) => {
  if (!text) return '';
  return text.toString().replace(/\|/g, '');
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
 * Convert consolidado data to TXT format with pipe separators
 */
const convertToTxtFormat = (consolidadoData, selectedPeriod) => {
  // Start with empty content (no headers)
  let txtContent = '';

  // Add data rows only
  consolidadoData.forEach(record => {
    const row = [
      escapePipeCharacters(record.tipoTercero),
      escapePipeCharacters(record.tipoOperacion),
      escapePipeCharacters(record.rfc),
      escapePipeCharacters(record.numeroIdentificacionFiscal),
      escapePipeCharacters(record.clienteNombre),
      escapePipeCharacters(record.codigoPais),
      escapePipeCharacters(record.juridiccion),
      formatNumericValue(record.valactValFn),
      formatNumericValue(record.valactDevFn),
      formatNumericValue(record.valactValFs),
      formatNumericValue(record.valactDevFs),
      formatNumericValue(record.valactVal16),
      formatNumericValue(record.valactDev16),
      formatNumericValue(record.valactValImptan16),
      formatNumericValue(record.valactDevImptan16),
      formatNumericValue(record.valactValImpint16),
      formatNumericValue(record.valactDevImpint16),
      formatNumericValue(record.ivaacredExclFn),
      formatNumericValue(record.ivaacredPropFn),
      formatNumericValue(record.ivaacredExclFs),
      formatNumericValue(record.ivaacredPropFs),
      formatNumericValue(record.ivaacredExcl16),
      formatNumericValue(record.ivaacredProp16),
      formatNumericValue(record.ivaacredExclImptan16),
      formatNumericValue(record.ivaacredPropImptan16),
      formatNumericValue(record.ivaacredExclImpint16),
      formatNumericValue(record.ivaacredPropImpint16),
      formatNumericValue(record.ivanoacredPropFn),
      formatNumericValue(record.ivanoacredNoreqFn),
      formatNumericValue(record.ivanoacredExentFn),
      formatNumericValue(record.ivanoacredNoobjFn),
      formatNumericValue(record.ivanoacredPropFs),
      formatNumericValue(record.ivanoacredNoreqFs),
      formatNumericValue(record.ivanoacredExentFs),
      formatNumericValue(record.ivanoacredNoobjFs),
      formatNumericValue(record.ivanoacredProp16),
      formatNumericValue(record.ivanoacredNoreq16),
      formatNumericValue(record.ivanoacredExent16),
      formatNumericValue(record.ivanoacredNoobj16),
      formatNumericValue(record.ivanoacredPropImptan16),
      formatNumericValue(record.ivanoacredNoreqImptan16),
      formatNumericValue(record.ivanoacredExentImptan16),
      formatNumericValue(record.ivanoacredNoobjImptan16),
      formatNumericValue(record.ivanoacredPropImpint16),
      formatNumericValue(record.ivanoacredNoreqImpint16),
      formatNumericValue(record.ivanoacredExentImpint16),
      formatNumericValue(record.ivanoacredNoobjImpint16),
      formatNumericValue(record.daIvaRetContrib),
      formatNumericValue(record.daImpExentIva),
      formatNumericValue(record.daExentIva),
      formatNumericValue(record.daOtros0Iva),
      formatNumericValue(record.daNoobjIvaNac),
      formatNumericValue(record.daNoobjIvaSinEst),
      formatBooleanValue(record.daEfectosFiscalesComp)
    ];

    txtContent += row.join('|') + '\n';
  });

  return txtContent;
};

/**
 * Download text content as UTF-8 encoded file
 */
const downloadTxtFile = (content, filename) => {
  // Create a Blob with UTF-8 encoding
  const blob = new Blob([content], { 
    type: 'text/plain;charset=utf-8' 
  });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Main export function
 */
export const exportDiotToTxt = async (tokenizedRequest, selectedPeriod, showToast) => {
  try {
    // Fetch empresa RFC and consolidado data
    const [empresaRfc, consolidadoData] = await Promise.all([
      fetchEmpresaRfc(tokenizedRequest),
      fetchDiotConsolidado(tokenizedRequest)
    ]);

    // Convert to TXT format
    const txtContent = convertToTxtFormat(consolidadoData, selectedPeriod);

    // Generate filename with new format: RFC_MM_YYYY_DIOT.txt
    const periodFormatted = formatPeriodForFilename(selectedPeriod);
    const filename = `${empresaRfc}_${periodFormatted}_DIOT.txt`;

    // Download file
    downloadTxtFile(txtContent, filename);

    showToast(`Archivo TXT exportado:\n${filename}`, 'success');
    
    return {
      success: true,
      filename,
      recordsCount: consolidadoData.length
    };

  } catch (error) {
    console.error('Error exporting to TXT:', error);
    const errorMessage = error.message || 'Error al exportar a TXT';
    showToast(`Error en exportación TXT: ${errorMessage}`, 'error');
    
    throw new Error(errorMessage);
  }
};