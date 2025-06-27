// utils/tokenManager.js

// Token credentials from environment
const USERNAME = process.env.NEXT_PUBLIC_MSERPSERVICE_USERNAME;
const PASSWORD = process.env.NEXT_PUBLIC_MSERPSERVICE_PASSWORD;

/**
 * Get company configuration from localStorage
 */
export const getCompanyConfig = () => {
  try {
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (!selectedCompany) {
      throw new Error('No hay empresa seleccionada en localStorage');
    }
    
    const companyData = JSON.parse(selectedCompany);
    
    // Decode base64 password
    const base64Password = companyData.passwordErpDb;
    const decodedPassword = atob(base64Password);
    
    return {
      urlErp: companyData.urlErp,
      serverErpDb: companyData.serverErpDb,
      nameErpDb: companyData.nameErpDb,
      userErpDb: companyData.userErpDb,
      passwordErpDb: decodedPassword
    };
  } catch (err) {
    console.error('Error reading company config from localStorage:', err);
    throw new Error('Error al obtener configuración de empresa');
  }
};

/**
 * Check if JWT token is valid (not expired)
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (err) {
    console.error('Error validating token:', err);
    return false;
  }
};

/**
 * Login to get new tokens
 */
export const loginForTokens = async (urlErp) => {
  try {
    if (!USERNAME || !PASSWORD) {
      throw new Error('Credenciales de autenticación no configuradas');
    }

    const response = await fetch(`${urlErp}/mserpservice/api/auth/login`, {
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

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store tokens in localStorage
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    console.log('Login successful, tokens stored');
    return data.accessToken;
  } catch (err) {
    console.error('Login error:', err);
    throw new Error('Error de autenticación: ' + err.message);
  }
};

/**
 * Refresh token to get new access token
 */
export const refreshAccessToken = async (urlErp) => {
  try {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${urlErp}/mserpservice/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshTokenValue
      })
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store new tokens
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    console.log('Token refreshed successfully');
    return data.accessToken;
  } catch (err) {
    console.error('Refresh token error:', err);
    // If refresh fails, clear tokens and force login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw new Error('Error al renovar token: ' + err.message);
  }
};

/**
 * Get valid token (check existing, refresh if needed, or login)
 */
export const getValidAccessToken = async (urlErp) => {
  try {
    // Check if we have a valid token
    const existingToken = localStorage.getItem('token');
    if (existingToken && isTokenValid(existingToken)) {
      console.log('Using existing valid token');
      return existingToken;
    }

    // Try to refresh token first
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (refreshTokenValue) {
      try {
        console.log('Attempting to refresh token...');
        return await refreshAccessToken(urlErp);
      } catch (refreshErr) {
        console.log('Refresh failed, attempting login...');
      }
    }

    // If refresh failed or no refresh token, do fresh login
    console.log('Performing fresh login...');
    return await loginForTokens(urlErp);
    
  } catch (err) {
    console.error('Token management error:', err);
    throw err;
  }
};

/**
 * Get headers with valid token for API requests
 */
export const getTokenizedHeaders = async () => {
  try {
    const companyData = getCompanyConfig();
    const token = await getValidAccessToken(companyData.urlErp);
    
    return {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept-Language': 'es-MX',
      'Server-Erp-Db': companyData.serverErpDb,
      'Name-Erp-Db': companyData.nameErpDb,
      'User-Erp-Db': companyData.userErpDb,
      'Password-Erp-Db': companyData.passwordErpDb
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Clear all stored tokens
 */
export const clearStoredTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  console.log('Stored tokens cleared');
};

/**
 * Build API URL with company's ERP URL
 */
export const buildApiUrl = (endpoint) => {
  const companyData = getCompanyConfig();
  return `${companyData.urlErp}${endpoint}`;
};