const mainLanguage = navigator.language.split("-")[0];
const languageToUse = mainLanguage === "es" ? "es-MX" : mainLanguage;

export const recuperarContraseña = {
  /**
   * Enviar correo electrónico para recuperar la contraseña
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async enviarCorreo(email) {
    const response = await fetch("/api/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": languageToUse,
      },
      body: JSON.stringify({
        action: "sendRecoveryEmail",
        email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error de conexión' }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Cambiar la contraseña del usuario usando datos encriptados
   * @param {string} encryptedData - Datos encriptados que contienen token y email
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} - true si fue exitoso, false si falló
   */
  async cambiarContraseñaConToken(encryptedData, newPassword) {
    try {
      const response = await fetch("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": languageToUse,
        },
        body: JSON.stringify({
          action: "resetPassword",
          encryptedData,
          newPassword,
        }),
      });

      // ✅ CLAVE: Parsear la respuesta JSON
      const data = await response.json();
      
      if (!response.ok) {
        // Si hay error HTTP, lanzar excepción con el mensaje del servidor
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      // ✅ CORRECCIÓN: NO lanzar error para tokens inválidos, solo devolver false
      if (data.statusCode === "200" || data.statusCode === 200) {
        return true;
      } else {
        // Token inválido/expirado es un flujo normal, no un error
        return false;
      }

    } catch (error) {
      // Solo re-lanzar errores de red o HTTP, no de tokens inválidos
      throw error;
    }
  },
};