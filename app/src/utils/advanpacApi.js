export const API_BASE_URL = process.env.ADVANPAC_API_BASE_URL;
export const API_HEADERS = {
  'x-api-key': process.env.API_KEY,
};

export async function callApiGateway({ endpoint, method = 'GET', params = {}, body = null, headers = {} }) {
  let url = `${API_BASE_URL}${endpoint}`;
  if (method === 'GET' && Object.keys(params).length) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  const allHeaders = { ...API_HEADERS, ...headers };
  const options = {
    method,
    headers: allHeaders,
  };

  if (method !== 'GET' && body !== null) {
    if (body === '') {
      // Para endpoints que requieren body vacío (como activate/inactivate)
      options.body = '';
    } else if (body instanceof FormData) {
      options.body = body;
      delete options.headers['Content-Type'];
    } else {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}