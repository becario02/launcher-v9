import { fetchApi } from "./index";

const mainLanguage = navigator.language.split('-')[0];
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;
export const recuperarContraseña = {

    /**
     * Enviar correo electrónico para recuperar la contraseña
     * @param {string} email - Correo electrónico del usuario
     * @returns {Promise} - Promesa con la respuesta del servidor
     */
    enviarCorreo(email) {
        return fetchApi('sendRecoveryEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': languageToUse
              },
            body: JSON.stringify({ email })
        });
    },
    
    /**
     * Cambiar la contraseña del usuario usando datos encriptados
     * @param {string} encryptedData - Datos encriptados que contienen token y email
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise} - Promesa con la respuesta del servidor
     */
    cambiarContraseñaConToken(encryptedData, newPassword) {
        return fetchApi('resetPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': languageToUse
            },
            body: JSON.stringify({ 
                encryptedData, 
                newPassword 
            })
        });
    }
};

