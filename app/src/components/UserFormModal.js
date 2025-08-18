"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import Cookies from "js-cookie";
import { usePrimaryColor } from "@/context/primaryColor";

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const { primaryColor } = usePrimaryColor();
  const modalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "NORMAL",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Muy débil",
    color: "bg-red-500",
  });
  const [errors, setErrors] = useState({});

  // Perfil de quien edita (cookies)
  const profileName = Cookies.get("profileName") || "";

  // Datos del usuario objetivo (el que se está editando)
  const isEditing = !!initialData;
  const initialType = (
    initialData?.type ||
    initialData?.profileName ||
    ""
  ).toUpperCase();

  // Solo puede editar email si (a) editor es ADMINCUSTOMER, o (b) editor es ADMINADVAN y el objetivo es ADMINCUSTOMER
  const onlyEmailEditable =
    profileName === "ADMINCUSTOMER" ||
    (profileName === "ADMINADVAN" && initialType === "ADMINCUSTOMER");

  // En solo-email, no exigimos dominio
  const skipEmailDomain = onlyEmailEditable;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const mappedRole = initialType.includes("ADMIN") ? "ADMIN" : "NORMAL";

        setFormData({
          fullname: initialData.fullname || "",
          email: initialData.email || "",
          username: initialData.username || "",
          password: "",
          role: mappedRole,
        });
      } else {
        setFormData({
          fullname: "",
          email: "",
          username: "",
          password: "",
          role: "NORMAL",
        });
      }

      setErrors({});
      setPasswordStrength({
        score: 0,
        label: "Muy débil",
        color: "bg-red-500",
      });

      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, initialData, initialType]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (formData.password) {
      const strength = evaluatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        score: 0,
        label: "Muy débil",
        color: "bg-red-500",
      });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateEmailDomain = (email) => {
    if (skipEmailDomain) return true;
    const requiredDomain = "@advanpro.com.mx";
    return email.endsWith(requiredDomain);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "fullname":
        if (!onlyEmailEditable && !value.trim()) {
          setErrors((p) => ({
            ...p,
            fullname: "El nombre completo es obligatorio",
          }));
        }
        break;

      case "email":
        if (!value.trim()) {
          setErrors((p) => ({
            ...p,
            email: "El correo electrónico es obligatorio",
          }));
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            setErrors((p) => ({
              ...p,
              email: "Formato de correo electrónico inválido",
            }));
          } else if (!validateEmailDomain(value)) {
            setErrors((p) => ({
              ...p,
              email: "El correo debe tener el dominio @advanpro.com.mx",
            }));
          }
        }
        break;

      case "username":
        if (!onlyEmailEditable) {
          if (!value.trim()) {
            setErrors((p) => ({
              ...p,
              username: "El nombre de usuario es obligatorio",
            }));
          } else if (value.length < 4) {
            setErrors((p) => ({
              ...p,
              username: "El nombre de usuario debe tener al menos 4 caracteres",
            }));
          }
        }
        break;

      case "password":
        if (!onlyEmailEditable) {
          if (!isEditing && !value) {
            setErrors((p) => ({
              ...p,
              password: "La contraseña es obligatoria",
            }));
          } else if (value) {
            const passwordErrors = validatePassword(value);
            if (passwordErrors.length > 0) {
              setErrors((p) => ({ ...p, password: passwordErrors[0] }));
            } else if (passwordStrength.score < 3) {
              setErrors((p) => ({
                ...p,
                password: "La contraseña no es lo suficientemente segura",
              }));
            }
          }
        }
        break;

      default:
        break;
    }
  };

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    if (/(.)\1{2,}/.test(password)) score -= 1;
    if (/^(?:123|abc|qwerty|password|contraseña|admin)/i.test(password))
      score -= 1;

    score = Math.max(0, Math.min(score, 5));

    const strengthMap = [
      { score: 0, label: "Muy débil", color: "bg-red-500" },
      { score: 1, label: "Muy débil", color: "bg-red-500" },
      { score: 2, label: "Débil", color: "bg-orange-500" },
      { score: 3, label: "Moderada", color: "bg-yellow-500" },
      { score: 4, label: "Fuerte", color: "bg-blue-500" },
      { score: 5, label: "Muy fuerte", color: "bg-green-500" },
    ];
    return strengthMap[score];
  };

  const validatePassword = (password) => {
    const errs = [];
    if (isEditing && !password) return errs;
    if (password.length < 8)
      errs.push("La contraseña debe tener al menos 8 caracteres");
    if (!/[a-z]/.test(password))
      errs.push("Debe incluir al menos una letra minúscula");
    if (!/[A-Z]/.test(password))
      errs.push("Debe incluir al menos una letra mayúscula");
    if (!/[0-9]/.test(password)) errs.push("Debe incluir al menos un número");
    if (!/[^a-zA-Z0-9]/.test(password))
      errs.push("Debe incluir al menos un carácter especial");
    if (/(.)\1{2,}/.test(password))
      errs.push("No debe contener caracteres repetidos consecutivamente");
    if (/^(?:123|abc|qwerty|password|contraseña|admin)/i.test(password))
      errs.push("No debe contener secuencias comunes o predecibles");
    return errs;
  };

  const renderStrengthIndicator = () => {
    const { score, label, color } = passwordStrength;
    const percentage = (score / 5) * 100;

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">Fortaleza:</span>
          <span
            className={`font-medium ${
              score <= 2
                ? "text-red-600 dark:text-red-400"
                : score <= 3
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const validateForm = () => {
    setErrors({});

    if (!onlyEmailEditable && !formData.fullname.trim()) {
      setErrors({ fullname: "El nombre completo es obligatorio" });
      return false;
    }

    if (!formData.email.trim()) {
      setErrors({ email: "El correo electrónico es obligatorio" });
      return false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors({ email: "Formato de correo electrónico inválido" });
        return false;
      } else if (!validateEmailDomain(formData.email)) {
        setErrors({
          email: "El correo debe tener el dominio @advanpro.com.mx",
        });
        return false;
      }
    }

    if (!onlyEmailEditable) {
      if (!formData.username.trim()) {
        setErrors({ username: "El nombre de usuario es obligatorio" });
        return false;
      } else if (formData.username.length < 4) {
        setErrors({
          username: "El nombre de usuario debe tener al menos 4 caracteres",
        });
        return false;
      }

      if (!isEditing) {
        if (!formData.password) {
          setErrors({ password: "La contraseña es obligatoria" });
          return false;
        } else {
          const passwordErrors = validatePassword(formData.password);
          if (passwordErrors.length > 0) {
            setErrors({ password: passwordErrors[0] });
            return false;
          } else if (passwordStrength.score < 3) {
            setErrors({
              password: "La contraseña no es lo suficientemente segura",
            });
            return false;
          }
        }
      } else if (formData.password) {
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
          setErrors({ password: passwordErrors[0] });
          return false;
        } else if (passwordStrength.score < 3) {
          setErrors({
            password: "La contraseña no es lo suficientemente segura",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let finalForm;

      if (initialData) {
        // EDICIÓN: enviar siempre fullname y password aunque estén vacíos
        const initialType = (
          initialData.type ||
          initialData.profileName ||
          ""
        ).toUpperCase();

        finalForm = {
          fullname: formData.fullname ?? "",
          email: formData.email ?? "",
          username: formData.username ?? "",
          password: formData.password ?? "", // ahora siempre lo mandas
          type: initialType,
        };
      } else {
        // CREACIÓN
        const mappedRole =
          formData.role === "ADMIN" ? "ADMINADVAN" : "USERADVAN";
        finalForm = {
          ...formData,
          type: mappedRole,
          password: formData.password ?? "",
          fullname: formData.fullname ?? "",
        };
      }

      await onSubmit(finalForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-[#1C1C24] rounded-xl w-full max-w-md shadow-xl p-6 relative font-poppins transition-all duration-300 transform ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {isEditing ? "Editar usuario" : "Crear nuevo usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Nombre completo */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Nombre completo
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={onlyEmailEditable}
              className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${
                errors.fullname
                  ? "border-red-400"
                  : "border-gray-300 dark:border-[#2C2C38]"
              } px-3 py-2 text-gray-800 dark:text-white ${
                onlyEmailEditable ? "cursor-not-allowed opacity-70" : ""
              }`}
            />
            {errors.fullname && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.fullname}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Correo electrónico
              {!skipEmailDomain && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  (debe ser @advanpro.com.mx)
                </span>
              )}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={
                skipEmailDomain
                  ? "correo@dominio.com"
                  : "ejemplo@advanpro.com.mx"
              }
              className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${
                errors.email
                  ? "border-red-400"
                  : "border-gray-300 dark:border-[#2C2C38]"
              } px-3 py-2 text-gray-800 dark:text-white`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={onlyEmailEditable}
              className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${
                errors.username
                  ? "border-red-400"
                  : "border-gray-300 dark:border-[#2C2C38]"
              } px-3 py-2 text-gray-800 dark:text-white ${
                onlyEmailEditable ? "cursor-not-allowed opacity-70" : ""
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password (oculta si solo-email) */}
          {!onlyEmailEditable && (
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${
                    errors.password
                      ? "border-red-400"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  } px-3 py-2 text-gray-800 dark:text-white pr-10`}
                  placeholder={isEditing ? "••••••••" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  {errors.password}
                </p>
              )}

              {(formData.password || !isEditing) && (
                <>
                  {formData.password && renderStrengthIndicator()}
                  <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1 pl-5 list-disc">
                    <li
                      className={
                        formData.password.length >= 8
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Mínimo 8 caracteres
                    </li>
                    <li
                      className={
                        /[a-z]/.test(formData.password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Al menos una letra minúscula
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(formData.password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Al menos una letra mayúscula
                    </li>
                    <li
                      className={
                        /[0-9]/.test(formData.password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Al menos un número
                    </li>
                    <li
                      className={
                        /[^a-zA-Z0-9]/.test(formData.password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Al menos un carácter especial
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Tipo de usuario
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={onlyEmailEditable}
              className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white ${
                onlyEmailEditable ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              <option value="NORMAL">Normal</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 mr-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "px-5 py-2 rounded-md text-white font-medium text-sm shadow",
                "hover:opacity-90 transition",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: primaryColor }}
            >
              {isEditing
                ? isSubmitting
                  ? "Guardando..."
                  : "Guardar cambios"
                : isSubmitting
                ? "Creando..."
                : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
