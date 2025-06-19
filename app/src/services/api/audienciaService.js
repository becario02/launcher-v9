const mainLanguage = typeof navigator !== 'undefined' 
  ? navigator.language.split('-')[0] 
  : 'en';
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;

export const audienciaService = {
    /**
     * Fetch get audiencia
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudiencia() {
        try {
            const response = await fetch('/api/news/audiencia?action=obtenerAudiencia', {
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
     * Fetch get applications
     * @returns {Promise} - Promise with the response
     */
    async obtenerAplicaciones() {
        try {
            const response = await fetch('/api/news/audiencia?action=obtenerAplicaciones', {
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
     * Fetch insert audience for launcher aplication
     * @param {Object} data - Data to be inserted
     */
    async insertarAudienciaLauncher(data) {
        try {
            const response = await fetch('/api/news/audiencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'insertarAudienciaLauncher',
                    ...data
                })
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
     * Fetch insert audience for all aplication woithout launcher
     * @param {Object} data - Data to be inserted
     */
    async insertarAudiencia(data) {
        try {
            const response = await fetch('/api/news/audiencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'insertarAudiencia',
                    ...data
                })
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
     * Fetch get audience Launcher by idNew de news
     * @param {Object} data - Data to be inserted
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudienciaLauncher(data) {
        try {
            const response = await fetch('/api/news/audiencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'obtenerAudienciaLauncher',
                    ...data
                })
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
     * Fetch get audience Apps by idNew de news
     * @param {Object} data - Data to be inserted
     * @returns {Promise} - Promise with the response
     */
    async obtenerAudienciaApps(data) {
        try {
            const response = await fetch('/api/news/audiencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': languageToUse
                },
                body: JSON.stringify({
                    action: 'obtenerAudienciaApps',
                    ...data
                })
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
    }
};