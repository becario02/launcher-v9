'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import clsx from 'clsx';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import SkeletonLoader from '@/components/SkeletonLoader';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import { Settings } from 'lucide-react';
import ProfileSettings from '@/components/profile/settings/ProfileSettings';
import PrimaryColorSettings from '@/components/profile/settings/PrimaryColorSettings';
import ThemeModeSettings from '@/components/profile/settings/ThemeModeSettings';
import ConnectionsSettings from '@/components/profile/settings/ConnectionsSettings';

const colorOptions = ['#0080FF', '#8B5CF6', '#EC4899', '#22C55E', '#F97316'];
const themeOptions = ['light', 'dark'];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { primaryColor, setPrimaryColor } = usePrimaryColor();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({ fullname: '', email: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({ fullname: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  const rawLang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userId = Cookies.get('idUser');
        if (!userId) throw new Error('No se encontró el ID de usuario');

        const response = await fetch(`http://localhost:5173/mslauncher/api/v1/profile?userId=${userId}`);
        const data = await response.json();

        if (data.statusCode === '200') {
          setProfileData(data.data);
          setFormData({
            fullname: data.data.fullname || '',
            email: data.data.email || ''
          });
        } else {
          throw new Error(data.message || 'Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveChanges = async () => {
    const newErrors = { fullname: '', email: '' };
    let hasErrors = false;

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'El nombre completo es obligatorio';
      hasErrors = true;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      const userId = Cookies.get('idUser');
      if (!userId) throw new Error('No se encontró el ID de usuario');

      const response = await fetch('http://localhost:5173/mslauncher/api/v1/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          idUser: parseInt(userId),
          fullname: formData.fullname,
          email: formData.email
        })
      });

      const data = await response.json();
      if (data.statusCode === '200') {
        setToast({ show: true, message: data.message || 'Perfil actualizado exitosamente', type: 'success' });
        if (formData.fullname !== profileData.fullname) {
          Cookies.set('fullname', formData.fullname, { expires: 7 });
        }
      } else {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({ show: true, message: error.message || 'Error al guardar los cambios', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 5000);
    }
  };

  return (
    <div className="flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        )}

        {showPasswordModal && (
          <ChangePasswordModal
            onClose={() => setShowPasswordModal(false)}
            onSuccess={(message) => {
              setToast({ show: true, message, type: 'success' });
              setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
            }}
          />
        )}

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="w-full max-w-3xl px-4 md:px-6 mx-auto md:mx-0 md:ml-24 lg:ml-28 xl:ml-32 space-y-12">
            <div className="flex items-center mb-6 pt-4">
              <Settings className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Configuración
              </h1>
            </div>

            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <>
                <ProfileSettings
                  formData={formData}
                  formErrors={formErrors}
                  onInputChange={handleInputChange}
                  onPasswordClick={() => setShowPasswordModal(true)}
                />

                <ConnectionsSettings />


                <PrimaryColorSettings
                  colorOptions={colorOptions}
                  primaryColor={primaryColor}
                  onChangeColor={setPrimaryColor}
                />

                <ThemeModeSettings
                  themeOptions={themeOptions}
                  currentTheme={theme}
                  onChangeTheme={setTheme}
                />

                <div className="flex justify-end mt-8">
                  <button
                    className={`bg-primary text-white px-6 py-2 rounded-md transition-opacity ${
                      isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}