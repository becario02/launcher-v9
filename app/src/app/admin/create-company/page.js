"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import { checkMserpServiceHealth } from "@/utils/validarMSERPService";

export default function CrearEmpresaPage() {
  const pathname = usePathname();
  const USERNAME = process.env.NEXT_PUBLIC_MSERPSERVICE_USERNAME;
  const PASSWORD = process.env.NEXT_PUBLIC_MSERPSERVICE_PASSWORD;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: "info",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    companyId: "",
    companyName: "",
    mserpUrl: "",
    dbIp: "",
    dbName: "",
    environment: "",
    launcherUser: "",
    erpUser: "",
    email: "",
    fullName: "",
    launcherPassword: "",
    erpPassword: "",
  });

  const [errors, setErrors] = useState({});

  const required = new Set([
    "companyId",
    "companyName",
    "mserpUrl",
    "dbIp",
    "dbName",
    "environment",
    "launcherUser",
    "erpUser",
    "email",
    "fullName",
    "launcherPassword",
    "erpPassword",
  ]);

  const labels = {
    companyId: "Identificador de la empresa",
    companyName: "Nombre de la empresa",
    mserpUrl: "URL del MSERPService",
    dbIp: "IP del servidor de la BD ERP",
    dbName: "Nombre de la BD ERP",
    environment: "Entorno",
    launcherUser: "Usuario de Launcher",
    erpUser: "Usuario del ERP",
    email: "Correo",
    fullName: "Nombre completo",
    launcherPassword: "Contraseña para Launcher",
    erpPassword: "Contraseña del ERP",
  };

  const isPasswordSecure = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/.test(pass || "");

  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());

  const isValidUrl = (v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !!u.host;
    } catch {
      return false;
    }
  };

  const validateField = (name, value, all = form) => {
    const val = (value ?? "").toString().trim();

    if (required.has(name) && !val) {
      return `El campo "${labels[name]}" es obligatorio.`;
    }

    if (name === "email" && val && !isValidEmail(val)) {
      return "El correo no tiene un formato válido.";
    }

    if (name === "mserpUrl" && val && !isValidUrl(val)) {
      return "La URL debe ser HTTPS y válida (ej.: https://api.ejemplo.com).";
    }

    if (
      (name === "launcherPassword" || name === "erpPassword") &&
      val &&
      !isPasswordSecure(val)
    ) {
      return "Mín. 8 caracteres, e incluye mayúscula, minúscula, número y símbolo.";
    }

    return ""; // sin error
  };

  const validateAll = (state = form) => {
    const nextErrors = {};
    Object.keys(state).forEach((k) => {
      const msg = validateField(k, state[k], state);
      if (msg) nextErrors[k] = msg;
    });
    return nextErrors;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // revalidación rápida para limpiar error al corregir
      const msg = validateField(name, value, next);
      setErrors((prevErr) => {
        const clone = { ...prevErr };
        if (msg) clone[name] = msg;
        else delete clone[name];
        return clone;
      });
      return next;
    });
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      ...(msg ? { [name]: msg } : { [name]: undefined }),
    }));
  };

  const login = async (urlErp) => {
    try {
      const response = await fetch(`${urlErp}/mserpservice/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: USERNAME,
          password: PASSWORD,
        }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    } catch (err) {
      console.error("Error en login:", err);
      return null;
    }
  };

  const refreshToken = async (urlErp) => {
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
      console.error("Error al refrescar token:", err);
      return null;
    }
  };

  const validarConexion = async (
    server,
    baseDatos,
    userErp,
    passwordErpDb,
    urlErp
  ) => {
    let token = await login(urlErp);
    if (!token)
      return {
        ok: false,
        message: "No se pudo autenticar para validar la conexión.",
      };

    const connectionString = `Server=${server};Database=${baseDatos};User Id=${userErp};Password=${passwordErpDb};TrustServerCertificate=True;`;
    const payload = { connectionString };

    const probar = async (bearer) =>
      fetch(`${urlErp}/mserpservice/api/probar-conexion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(payload),
      });

    try {
      let res = await probar(token);

      if (res.status === 401) {
        token = await refreshToken(urlErp);
        if (!token)
          return {
            ok: false,
            message: "No se pudo refrescar el token para validar la conexión.",
          };
        res = await probar(token);
      }

      if (!res.ok) {
        return {
          ok: false,
          message:
            "La conexión que intentas agregar es incorrecta o no es válida.",
        };
      }

      let data = null;
      try {
        data = await res.json();
      } catch {}

      const msg = (data?.message || "").toLowerCase();
      const esExitosa =
        msg.includes("conexión exitosa") || msg.includes("conexion exitosa");

      return esExitosa
        ? { ok: true }
        : {
            ok: false,
            message:
              data?.message ||
              "La conexión que intentas agregar es incorrecta o no es válida.",
          };
    } catch (e) {
      console.error("Error al probar conexión:", e);
      return {
        ok: false,
        message: "Error al validar la conexión (red o servidor).",
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = validateAll();
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      // focus al primero con error
      const first = Object.keys(allErrors)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el?.focus) el.focus();
      return;
    }

    setIsLoading(true);
    setToast({ visible: false, type: "info", message: "" });

    const payload = {
      companyIdentifier: (form.companyId || "").trim(),
      companyName: (form.companyName || "").trim(),
      username: (form.launcherUser || "").trim(),
      urlErp: (form.mserpUrl || "").trim(),
      userErpDb: (form.erpUser || "").trim(),
      passwordErpDb: form.erpPassword || "",
      serverErpDb: (form.dbIp || "").trim(),
      nameErpDb: (form.dbName || "").trim(),
      environment: form.environment || "",
      email: (form.email || "").trim(),
      fullName: (form.fullName || "").trim(),
      password: form.launcherPassword || "",
    };

    /*const check = await checkMserpServiceHealth(form.mserpUrl);
    if (!check.ok) {
      setIsLoading(false);
      setToast({
        visible: true,
        type: "error",
        message:
          "La URL del servicio MSERPService no es válida. Revisa que la URL sea correcta y que el MSERPService esté activo y tenga el certificado SSL valido(no son validos los auto firmados) .",
      });
      setErrors((e) => ({
        ...e,
        mserpUrl: e.mserpUrl || "Verifica la URL del MSERPService",
      }));
      return;
    }*/

    const conn = await validarConexion(
      payload.serverErpDb,
      payload.nameErpDb,
      payload.userErpDb,
      payload.passwordErpDb,
      payload.urlErp
    );

    if (!conn.ok) {
      setIsLoading(false);
      setToast({
        visible: true,
        type: "error",
        message:
          conn.message ||
          "La conexión que intentas agregar es incorrecta o no es válida.",
      });
      setErrors((e) => ({
        ...e,
        dbIp: e.dbIp || "Verifica el servidor/IP.",
        dbName: e.dbName || "Verifica el nombre de la BD.",
        erpUser: e.erpUser || "Verifica el usuario de la BD.",
        erpPassword: e.erpPassword || "Verifica la contraseña de la BD.",
      }));
      return;
    }

    try {
      const res = await fetch("/api/crear-empresa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "es-MX",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      const ok = res.ok || String(data?.statusCode || "").startsWith("2");

      if (ok) {
        setToast({
          visible: true,
          type: "success",
          message: `Empresa "${
            form.companyName || "sin nombre"
          }" creada correctamente.`,
        });
        setForm({
          companyId: "",
          companyName: "",
          mserpUrl: "",
          dbIp: "",
          dbName: "",
          environment: "",
          launcherUser: "",
          erpUser: "",
          email: "",
          fullName: "",
          launcherPassword: "",
          erpPassword: "",
        });
        setErrors({});
      } else {
        setToast({
          visible: true,
          type: "error",
          message:
            `No se pudo crear "${form.companyName || "la empresa"}". ` +
            (data?.message || "Error en la solicitud."),
        });
      }
    } catch {
      setToast({
        visible: true,
        type: "error",
        message: `No se pudo crear "${
          form.companyName || "la empresa"
        }". Error de red o servidor.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Label = ({ name, children }) => (
    <label className="block text-sm mb-1">
      {children} {required.has(name) && <span className="text-red-500">*</span>}
    </label>
  );

  const base =
    "w-full rounded-lg border px-3 py-2 outline-none bg-white dark:bg-[#0f0f14] placeholder:text-p-small";
  const borderOk =
    "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10";
  const borderErr = "border-red-500 focus:ring-2 focus:ring-red-500/20";

  const inputClass = (name) => `${base} ${errors[name] ? borderErr : borderOk}`;

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1c1c24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-white dark:bg-[#1c1c24] pt-0 w-full text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 h-full min-w-0 w-full">
            {toast.visible && (
              <div className="fixed top-4 right-4 z-[9999]">
                <div className="max-w-xs sm:max-w-sm md:max-w-md w-[92vw] sm:w-auto break-words whitespace-normal leading-snug text-sm">
                  <Notification
                    visible
                    type={toast.type}
                    message={toast.message}
                    style="toast"
                    onClose={() => setToast((t) => ({ ...t, visible: false }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-6 h-full flex flex-col w-full min-w-0">
              <div className="w-full max-w-4xl mx-auto">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 md:p-8 mb-5 bg-white dark:bg-[#15151b]">
                  <header className="mb-6">
                    <h1 className="text-2xl font-semibold">
                      Crear nueva empresa
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Completa los datos de la empresa y la información del
                      administrador base.
                    </p>
                  </header>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                    noValidate
                  >
                    {/* Información de la Empresa */}
                    <section>
                      <h2 className="text-lg font-semibold mb-4">
                        Información de la empresa
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label name="companyId">
                            Identificador de la empresa
                          </Label>
                          <input
                            name="companyId"
                            value={form.companyId}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., 1001"
                            className={inputClass("companyId")}
                            aria-invalid={!!errors.companyId}
                            aria-describedby={
                              errors.companyId ? "err-companyId" : undefined
                            }
                          />
                          {errors.companyId && (
                            <p
                              id="err-companyId"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.companyId}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="companyName">Nombre de la empresa</Label>
                          <input
                            name="companyName"
                            value={form.companyName}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., Corporación Acme"
                            className={inputClass("companyName")}
                            aria-invalid={!!errors.companyName}
                            aria-describedby={
                              errors.companyName ? "err-companyName" : undefined
                            }
                          />
                          {errors.companyName && (
                            <p
                              id="err-companyName"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.companyName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="mserpUrl">URL del MSERPService</Label>
                          <input
                            type="url"
                            name="mserpUrl"
                            value={form.mserpUrl}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="https://api.ejemplo.com"
                            className={inputClass("mserpUrl")}
                            aria-invalid={!!errors.mserpUrl}
                            aria-describedby={
                              errors.mserpUrl ? "err-mserpUrl" : undefined
                            }
                          />
                          {errors.mserpUrl && (
                            <p
                              id="err-mserpUrl"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.mserpUrl}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="dbIp">
                            IP del servidor de la BD ERP con puerto
                          </Label>
                          <input
                            name="dbIp"
                            value={form.dbIp}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., 10.0.0.12,3306"
                            className={inputClass("dbIp")}
                            aria-invalid={!!errors.dbIp}
                            aria-describedby={
                              errors.dbIp ? "err-dbIp" : undefined
                            }
                          />
                          {errors.dbIp && (
                            <p
                              id="err-dbIp"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.dbIp}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="dbName">Nombre de la BD ERP</Label>
                          <input
                            name="dbName"
                            value={form.dbName}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., acme_prod"
                            className={inputClass("dbName")}
                            aria-invalid={!!errors.dbName}
                            aria-describedby={
                              errors.dbName ? "err-dbName" : undefined
                            }
                          />
                          {errors.dbName && (
                            <p
                              id="err-dbName"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.dbName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="environment">Entorno</Label>
                          <select
                            name="environment"
                            value={form.environment}
                            onChange={onChange}
                            onBlur={onBlur}
                            className={inputClass("environment")}
                            aria-invalid={!!errors.environment}
                            aria-describedby={
                              errors.environment ? "err-environment" : undefined
                            }
                          >
                            <option value="">Selecciona un entorno</option>
                            <option value="PRODUCTION">Producción</option>
                            <option value="TEST">Pruebas</option>
                          </select>
                          {errors.environment && (
                            <p
                              id="err-environment"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.environment}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Información del Administrador Base */}
                    <section>
                      <h2 className="text-lg font-semibold mb-4">
                        Información del administrador base
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label name="launcherUser">Usuario de Launcher</Label>
                          <input
                            name="launcherUser"
                            value={form.launcherUser}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., launch.admin"
                            className={inputClass("launcherUser")}
                            aria-invalid={!!errors.launcherUser}
                            aria-describedby={
                              errors.launcherUser
                                ? "err-launcherUser"
                                : undefined
                            }
                          />
                          {errors.launcherUser && (
                            <p
                              id="err-launcherUser"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.launcherUser}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="erpUser">Usuario del ERP</Label>
                          <input
                            name="erpUser"
                            value={form.erpUser}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., db_admin"
                            className={inputClass("erpUser")}
                            aria-invalid={!!errors.erpUser}
                            aria-describedby={
                              errors.erpUser ? "err-erpUser" : undefined
                            }
                          />
                          {errors.erpUser && (
                            <p
                              id="err-erpUser"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.erpUser}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="email">Correo</Label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="correo@ejemplo.com"
                            className={inputClass("email")}
                            aria-invalid={!!errors.email}
                            aria-describedby={
                              errors.email ? "err-email" : undefined
                            }
                          />
                          {errors.email && (
                            <p
                              id="err-email"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="fullName">Nombre completo</Label>
                          <input
                            name="fullName"
                            value={form.fullName}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Ej., Juan Pérez"
                            className={inputClass("fullName")}
                            aria-invalid={!!errors.fullName}
                            aria-describedby={
                              errors.fullName ? "err-fullName" : undefined
                            }
                          />
                          {errors.fullName && (
                            <p
                              id="err-fullName"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="launcherPassword">
                            Contraseña para Launcher
                          </Label>
                          <input
                            type="password"
                            name="launcherPassword"
                            value={form.launcherPassword}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Mín. 8, con mayúscula, minúscula, número y símbolo"
                            className={inputClass("launcherPassword")}
                            aria-invalid={!!errors.launcherPassword}
                            aria-describedby={
                              errors.launcherPassword
                                ? "err-launcherPassword"
                                : undefined
                            }
                          />
                          {errors.launcherPassword && (
                            <p
                              id="err-launcherPassword"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.launcherPassword}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label name="erpPassword">Contraseña del ERP</Label>
                          <input
                            type="password"
                            name="erpPassword"
                            value={form.erpPassword}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder="Mín. 8, con mayúscula, minúscula, número y símbolo"
                            className={inputClass("erpPassword")}
                            aria-invalid={!!errors.erpPassword}
                            aria-describedby={
                              errors.erpPassword ? "err-erpPassword" : undefined
                            }
                          />
                          {errors.erpPassword && (
                            <p
                              id="err-erpPassword"
                              className="mt-1 text-xs text-red-500"
                            >
                              {errors.erpPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-5 py-2.5 rounded-full bg-primary text-white font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Guardando..." : "Crear empresa"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* /CARD */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
