import Image from 'next/image';
import { Pencil } from 'lucide-react';

export default function ProfileSettings({
  formData,
  formErrors,
  onInputChange,
  onPasswordClick
}) {
  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-60 pt-2">
        <h3 className="text-[14px] font-medium text-[#000] dark:text-[#e2e2ea]">Perfil</h3>
        <p className="text-[12px] text-[#696974] dark:text-[#92929d] mt-1">
          Tu información personal y los ajustes de seguridad de la cuenta.
        </p>
      </div>
      <div className="flex-1">
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image src="/assets/navbar/perfil.jpg" alt="Avatar" width={48} height={48} />
            </div>
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1">
              <Pencil className="w-4 h-4" /> Cambiar avatar
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre completo</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={onInputChange}
                className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.fullname ? 'border-red-500' : 'border-gray-300'} dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white`}
              />
              {formErrors.fullname && <p className="text-red-500 text-xs mt-1">{formErrors.fullname}</p>}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Correo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 dark:text-gray-400">Contraseña</label>
              <input
                type="password"
                value="••••••••"
                disabled
                className="w-full rounded-md bg-gray-100 dark:bg-[#16161E] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-gray-500 cursor-not-allowed"
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  onClick={onPasswordClick}
                >
                  <Pencil className="w-4 h-4" />
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}