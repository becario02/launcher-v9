import { fetchApi } from "./index";

const mainLanguage = navigator.language.split('-')[0];
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;

export const audienciaService = {
    /**
     * Fetch get audiencia
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudiencia() {
        try {
            const response = await fetchApi('allClients/allUsers', {
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
     * Fetch get applications
     * @returns {Promise} - Promise with the response
     */
    async obtenerAplicaciones() {
        try {
            const response = await fetchApi('apps', {
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
     * Fetch insert audience for launcher aplication
     * @param {Object} data - Data to be inserted
     */
    async insertarAudienciaLauncher(data) {
        try {
            const response = await fetchApi('news/audienceLauncher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            })
            return response;
        }
        catch (error) {
            throw error;
        }
    },

    /**
     * Fetch insert audience for all aplication woithout launcher
     * @param {Object} data - Data to be inserted
     */
    async insertarAudiencia(data) {
        try {
            const response = await fetchApi('news/audienceApps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            })
            return response;
        }
        catch (error) {
            throw error;
        }
    },

    /**
     * Fetch get audience Launcher by idNew de news
     * @param {Object} data - Data to be inserted
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudienciaLauncher(data) {
        try {
            const response = await fetchApi(`news/getAudienceLauncher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            })
            return response;
        }
        catch (error) {
            throw error;
        }
    },

    /**
     * Fetch get audience Apps by idNew de news
     * @param {Object} data - Data to be inserted
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudienciaApps(data) {
        try {
            const response = await fetchApi(`news/getAudienceApps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify(data)
            })
            return response;
        }
        catch (error) {
            throw error;
        }
    }
};