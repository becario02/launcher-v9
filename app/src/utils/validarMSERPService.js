export async function checkMserpServiceHealth(url) {
  // Normalizar y agregar /swagger/index.html
  const base = url.trim().replace(/\/+$/, "");
  url = `${base}/swagger/index.html`;

  try {
    const protocol = new URL(url).protocol;
    if (protocol !== "https:") {
      return {
        ok: false,
        message:
          `La URL del servicio MSERPService (${url}) utiliza el protocolo HTTP, que no es seguro. ` +
          `Por razones de seguridad, solo se permiten conexiones HTTPS con certificados válidos(no auto firmados). ` +
          `Este problema no está relacionado con la aplicación Launcher, sino con la configuración del servidor que hospeda el MSERPService. ` +
          `Por favor, asegúrate de habilitar HTTPS y configurar correctamente el certificado SSL.`,
      };
    }

    // ===== ÚNICO CAMBIO: consultar a tu endpoint server-side para evitar CORS =====
    const apiRes = await fetch("/api/validate-mserp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: base }), // le pasamos la base sin /swagger/index.html
      cache: "no-store",
    }).then(r => r.json());

    // Mapeo para reutilizar tus validaciones sin tocarlas
    const response = {
      ok: apiRes.ok,
      status: apiRes.status,
      statusText: apiRes.statusText || "",
    };
    // ============================================================================

    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectTo = "desconocida";

      return {
        ok: false,
        message:
          `La URL del servicio MSERPService (${url}) respondió con una redirección permanente (código ${response.status}). ` +
          `Esto indica que el recurso fue movido definitivamente a otra ubicación. ` +
          `Nueva ubicación sugerida: ${redirectTo}. ` +
          `Verifica que la URL esté actualizada, que la nueva ubicación sea segura y esté configurada correctamente. ` +
          `Este problema no está relacionado con la aplicación Launcher.`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        message:
          `La URL proporcionada del servicio MSERPService (${url}) respondió con el código ${response.status} (${response.statusText}). ` +
          `Este servicio es parte del ecosistema del ERP, pero no está relacionado directamente con la aplicación Launcher, su base de datos ni sus servicios. ` +
          `Por favor, verifica que el servidor MSERPService esté activo y configurado correctamente.`,
      };
    }

    return {
      ok: true,
      message:
        "La URL del servicio MSERPService es válida, accesible y segura.",
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        ok: false,
        message:
          `La solicitud a la URL del servicio MSERPService (${url}) superó el tiempo máximo de espera. ` +
          `Esto puede deberse a que el servidor está apagado, saturado o inaccesible. Este problema es externo a la aplicación Launcher.`,
      };
    }

    if (
      error.message.includes("SSL") ||
      error.message.includes("certificate")
    ) {
      return {
        ok: false,
        message:
          `Error crítico al validar el certificado SSL de la URL del servicio MSERPService (${url}). ` +
          `El certificado no es válido, ha expirado o no proviene de una entidad confiable. ` +
          `Este problema es exclusivo del servidor que hospeda MSERPService y no está relacionado con la aplicación Launcher.`,
      };
    }

    if (error.message.includes("Failed to fetch")) {
      return {
        ok: false,
        message:
          `No se pudo establecer conexión con la URL del servicio MSERPService (${url}). ` +
          `Es posible que el dominio esté mal escrito, el servidor esté apagado o haya un error de DNS/red. ` +
          `Este error no está relacionado con la aplicación Launcher.`,
      };
    }

    return {
      ok: false,
      message:
        `Error inesperado al validar la URL del servicio MSERPService (${url}): ${error.message}. ` +
        `Este problema es responsabilidad del entorno donde se hospeda el servicio y no tiene relación con Launcher o su infraestructura.`,
    };
  }
}
