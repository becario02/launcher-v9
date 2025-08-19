'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/context/auth';
import Cookies from 'js-cookie';

/* ===== Deep link helper: usar iframe oculto para no interrumpir la navegación ===== */
function useDeepLinkInvoker() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    return () => {
      try { document.body.removeChild(iframe); } catch {}
    };
  }, []);

  const invoke = (url) => {
    try {
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
    } catch {
      /* ignorar */
    }
  };

  return invoke;
}

/* ===================== Helper: cerrar TODAS las instancias ===================== */
async function closeAllInstancesOnLogout(invokeDeepLink) {
  // 1) Resolver empresa/usuario a partir de selectedCompany
  const scRaw = localStorage.getItem('selectedCompany');
  let company = 'default';
  let user = 'default';
  try {
    const sc = scRaw ? JSON.parse(scRaw) : null;
    company = sc?.name || 'default';
    user = sc?.fullname || 'default';
  } catch {}

  // 2) Leer todas las instancias globales
  const globalKey = `${company}-${user}-global-instances`;
  let instances = [];
  try {
    const arr = JSON.parse(localStorage.getItem(globalKey) || '[]');
    instances = Array.isArray(arr) ? arr : [];
  } catch {}

  // 3) Solicitar cierre en backend y conector SIN cambiar window.location
  await Promise.all(
    instances.map(async (inst) => {
      const idSession = inst?.idSession;
      const idCompanyModule = inst?.idCompanyModule;
      const exeName = inst?.exeName;

      // 3.1 Avisar a tu API que cierre la sesión de esa instancia (no bloqueante si falla)
      if (idSession && idCompanyModule) {
        try {
          await fetch('/api/session', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idSession, idCompanyModule }),
          });
        } catch {}
      }

      // 3.2 Pedir al conector cerrar el ejecutable mediante deep link en iframe
      if (exeName && idSession) {
        try {
          invokeDeepLink(`advanerpconnect://close/${exeName}?session=${idSession}`);
        } catch {}
      }
    })
  );

  // 4) Limpieza de storages relacionados
  try { localStorage.removeItem(globalKey); } catch {}

  try {
    // Llaves por módulo: `${company}-${user}-${module}-instances`
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${company}-${user}-`) && k.endsWith('-instances')) {
        localStorage.removeItem(k);
      }
    }
  } catch {}

  // Opcionales si los usas
  localStorage.removeItem('sessionData');
  localStorage.removeItem('currentModuleData');
}
/* ============================================================================== */

const ProfilePopup = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const invokeDeepLink = useDeepLinkInvoker();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Cerrar todas las instancias primero (sin interrumpir la navegación)
      await closeAllInstancesOnLogout(invokeDeepLink);
    } catch {
      // aunque falle, continuamos con logout
    } finally {
      // Limpiar cookies
      Cookies.remove('auth');
      Cookies.remove('idUser');
      Cookies.remove('fullname');
      Cookies.remove('companyName');
      Cookies.remove('urlErp');
      Cookies.remove('passwordErpDb');
      Cookies.remove('serverErpDb');
      Cookies.remove('nameErpDb');

      // Limpiar storage
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('userData');

      // Cerrar sesión en tu contexto (aquí ya no hay nada que interfiera)
      logout();
    }
  };

  useEffect(() => {
    let timers = [];
    if (isOpen) {
      setMounted(true);
      timers.push(setTimeout(() => setShowAnimation(true), 50));
    } else {
      setShowAnimation(false);
      timers.push(setTimeout(() => setMounted(false), 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 mt-[110px] mr-4 sm:mr-4 md:mr-16 w-48 bg-white dark:bg-[#1C1C24] 
          rounded-2xl shadow-xl border border-gray-100 dark:border-[#2C2C38] z-50 transition-all duration-200
          ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              router.push('/profile');
              onClose();
            }}
            className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38] px-3 py-2 rounded-lg transition"
          >
            <User className="w-4 h-4" />
            Perfil
          </button>

          <button
            onClick={() => {
              router.push('/profile/settings');
              onClose();
            }}
            className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38] px-3 py-2 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition
              ${isLoggingOut
                ? 'opacity-60 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2C2C38]'}`}
            title={isLoggingOut ? 'Cerrando sesión…' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Cerrando…' : 'Logout'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;
