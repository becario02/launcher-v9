import { fetchApi } from "./index";

const mainLanguage = navigator.language.split('-')[0];
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;
export const newsService = {
    /**
     * Fetch get news
     * @returns {Promise} - Promise with the response
     */
    async obtenerNoticias() {
        try {
            const response = await fetchApi('/mslauncher/api/v1/getAdminNews', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                }
            })
            return response;
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
            const response = await fetchApi('/mslauncher/api/v1/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch update news
     * @param {Object} data - Data to send
     * @returns {Promise} - Promise with the response
     */
    async actualizarNoticia( data    ) {
        try {
            const response = await fetchApi('/mslauncher/api/v1/updateNews', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(   data   )
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch desactiar news
     * @param {Object} data - Data to send
     */
    async desactivarNoticia( data ) {
        try {
            const response = await fetchApi('/mslauncher/api/v1/news/deactivate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch activar news
     * @param {Object} data - Data to send
     */
    async activarNoticia( data ) {
        try {
            const response = await fetchApi('/mslauncher/api/v1/news/activate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};