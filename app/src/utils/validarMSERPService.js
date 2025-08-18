export async function checkMserpServiceHealth(url) {
  const base = url.trim().replace(/\/+$/, "");
  const displayUrl = base;
  const versionUrl = `${base}/mserpservice/api/v1/version`;

  try {
    const protocol = new URL(versionUrl).protocol;
    if (protocol !== "https:") {
      return {
        ok: false,
        message:
          `La URL del servicio MSERPService (${displayUrl}) utiliza el protocolo HTTP, que no es seguro. ` +
          `Por seguridad, solo se permiten conexiones HTTPS con certificados válidos (no autofirmados). ` +
          `Este problema no está relacionado con la aplicación Launcher, sino con la configuración del servidor que hospeda el MSERPService. ` +
          `Por favor, habilita HTTPS y configura correctamente el certificado SSL.`,
      };
    }

    const apiRes = await fetch("/api/validate-mserp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: versionUrl }),
      cache: "no-store",
    }).then((r) => r.json());

    const response = {
      ok: apiRes.ok,
      status: apiRes.status,
      statusText: apiRes.statusText || "",
    };

    if ([301, 302, 307, 308].includes(response.status)) {
      const redirectTo = "desconocida";
      return {
        ok: false,
        message:
          `La URL del servicio MSERPService (${displayUrl}) respondió con una redirección (código ${response.status}). ` +
          `El recurso fue movido a otra ubicación (${redirectTo}). ` +
          `Verifica que la URL esté actualizada y sea segura. ` +
          `Este problema no está relacionado con la aplicación Launcher.`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        message:
          `La URL del servicio MSERPService (${displayUrl}) respondió con el código ${response.status} (${response.statusText}). ` +
          `Verifica que el servidor MSERPService esté activo y configurado correctamente.`,
      };
    }

    return {
      ok: true,
      message: `La URL del servicio MSERPService (${displayUrl}) es válida, accesible y segura (validación de versión).`,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        ok: false,
        message:
          `La solicitud a la URL del servicio MSERPService (${displayUrl}) superó el tiempo máximo de espera. ` +
          `Puede deberse a que el servidor está apagado, saturado o inaccesible.`,
      };
    }

    if (error.message?.includes("SSL") || error.message?.includes("certificate")) {
      return {
        ok: false,
        message:
          `Error al validar el certificado SSL de la URL (${displayUrl}). ` +
          `El certificado no es válido, ha expirado o no proviene de una entidad confiable.`,
      };
    }

    if (error.message?.includes("Failed to fetch")) {
      return {
        ok: false,
        message:
          `No se pudo establecer conexión con la URL del servicio MSERPService (${displayUrl}). ` +
          `Revisa el dominio, DNS/red o que el servidor esté en línea.`,
      };
    }

    return {
      ok: false,
      message:
        `Error inesperado al validar la URL del servicio MSERPService (${displayUrl}): ${error.message}.`,
    };
  }
}
