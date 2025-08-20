import { useState, useCallback, useRef } from "react";
import { decryptAES } from "@/utils/aesDecrypt";
import { checkMserpServiceHealth } from "@/utils/validarMSERPService";

export const useSyncModules = () => {
  const USERNAME = process.env.NEXT_PUBLIC_MSERPSERVICE_USERNAME;
  const PASSWORD = process.env.NEXT_PUBLIC_MSERPSERVICE_PASSWORD;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const selectedCompanyStorage = localStorage.getItem("selectedCompany");
  const selectedCompany = JSON.parse(selectedCompanyStorage);

  const activeRequestRef = useRef(null);

  const login = useCallback(async (urlErp) => {
    setError(""); 

    /*const check = await checkMserpServiceHealth(urlErp);
    if (!check.ok) {
      setError(check.message);
      return null;
    }*/

    try {
      const response = await fetch(`${urlErp}/mserpservice/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(
          `Error al autenticar con MSERPService: ${
            errorText || response.statusText
          }`
        );
        return null;
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      return data.accessToken;
    } catch (err) {
      setError(
        `Error inesperado durante login con MSERPService: ${err.message}`
      );
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (urlErp) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await fetch(`${urlErp}/mserpservice/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      localStorage.setItem("token", data.token);

      return data.token;
    } catch (err) {
      return null;
    }
  }, []);

  const syncModules = useCallback(
    async (company) => {
      if (!company || !company.urlErp || !company.idUserCompanyConnection) {
        setError("Datos de empresa incompletos");
        return null;
      }

      if (isLoading || activeRequestRef.current) {
        return null;
      }

      const requestId = Date.now();
      activeRequestRef.current = requestId;

      setIsLoading(true);
      setError(null);

      try {
        let token = await login(company.urlErp);

        if (!token) {
          return null;
        }

        const encryptedPassword = company.passwordErpDb;
        const decodedPassword = decryptAES(encryptedPassword);

        const payload = {
          urlErp: company.urlErp,
          idUserCompanyConnection: company.idUserCompanyConnection,
          accessToken: token,
          Server_Erp_Db: company.serverErpDb,
          Name_Erp_Db: company.nameErpDb,
          User_Erp_Db: company.userErpDb,
          Password_Erp_Db: decodedPassword,
        };

        let response = await fetch("/api/sync-company-modules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Accept-Language": "es-MX",
          },
          body: JSON.stringify(payload),
        });

        if (activeRequestRef.current !== requestId) {
          return null;
        }

        if (response.status === 401 || response.status === 404) {
          token = await refreshToken(company.urlErp);
          if (!token) {
            setError("Error al refrescar token");
            return null;
          }

          response = await fetch("/api/sync-company-modules", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "Accept-Language": "es-MX",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            setError("Error al sincronizar tras refrescar token");
            return null;
          }
        } else if (!response.ok) {
          setError(`Error ${response.status}: ${response.statusText}`);
          return null;
        }

        const data = await response.json();

        if (data.statusCode !== "200") {
          setError(
            data.message || "Error durante la sincronización de módulos"
          );
          return null;
        }

        // ✅ RETORNAR EL RESULTADO CON EL MENSAJE DEL API
        return {
          success: true,
          message: data.message,
          data: data
        };
      } catch (err) {
        setError(err.message || "Error inesperado");
        return null;
      } finally {
        if (activeRequestRef.current === requestId) {
          setIsLoading(false);
          activeRequestRef.current = null;
        }
      }
    },
    [login, refreshToken, isLoading]
  );

  const cancelPendingRequests = useCallback(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    syncModules,
    isLoading,
    error,
    cancelPendingRequests,
  };
};