const mainLanguage = typeof navigator !== 'undefined' 
  ? navigator.language.split('-')[0] 
  : 'en';
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;

export const newsService = {
    /**
     * Fetch get news
     * @returns {Promise} - Promise with the response
     */
    async obtenerNoticias() {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        }
        catch (error) {
            throw error;
        }
    },

    /**
     * Fetch add news
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise with the response
     */
    async agregarNoticia(data) {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch update news
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise with the response
     */
    async actualizarNoticia(data) {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'update',
                    ...data
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch desactivar news
     * @param {Object} data - Data to send
     */
    async desactivarNoticia(data) {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'deactivate',
                    ...data
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch activar news
     * @param {Object} data - Data to send
     */
    async activarNoticia(data) {
        try {
            const response = await fetch('/api/news/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'activate',
                    ...data
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};