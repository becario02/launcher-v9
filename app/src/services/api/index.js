/**
 * Configuración base para todas las llamadas a la API
 * 
 * Este archivo centraliza la configuración y funciones comunes
 * para consumir APIs externas
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

/**
 * Función base para realizar peticiones a la API
 * @param {string} endpoint - Ruta relativa del endpoint
 * @param {object} options - Opciones adicionales para fetch
 * @returns {Promise} - Promesa con la respuesta procesada
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': process.env.API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(typeof window !== 'undefined' && localStorage.getItem('token') 
            ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
            : {})
      },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      } catch (e) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
    
  } catch (error) {
    
    if (error.name === 'AbortError') {
      throw new Error(`La petición excedió el tiempo límite de ${DEFAULT_TIMEOUT/1000} segundos`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


export * from './recuperarContraseña';
export * from './newsService';