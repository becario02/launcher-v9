import { Check } from 'lucide-react';
import clsx from 'clsx';

export default function ThemeModeSettings({ themeOptions, currentTheme, onChangeTheme }) {
  return (
    <div className="flex flex-col md:flex-row gap-10 mt-8">
      <div className="w-full md:w-60 pt-2">
        <h3 className="text-[14px] font-medium text-[#000] dark:text-[#e2e2ea]">Modo de tema</h3>
        <p className="text-[12px] text-[#696974] dark:text-[#92929d] mt-1">
          Elige el modo claro u oscuro, o cámbialo automáticamente según el sistema.
        </p>
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm flex gap-4">

          {/* Light Theme */}
          <button
            onClick={() => onChangeTheme('light')}
            className={clsx(
              'relative w-24 h-16 p-2 rounded-[6px] flex flex-col justify-between border transition-all bg-white',
              currentTheme === 'light' ? 'border-gray-400' : 'border border-gray-300'
            )}
          >
            {/* CHECK CENTRADO */}
            {currentTheme === 'light' && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Check className="w-5 h-5 text-gray-700" />
              </div>
            )}

            {/* Contenido visual */}
            <div className="space-y-1 z-0">
              <div className="w-4 h-2 rounded-sm bg-[#D1D5DB]" />
              <div className="w-3/4 h-3 rounded-sm bg-[#D1D5DB]" />
            </div>
            <div className="flex gap-1 justify-start z-0">
              <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
              <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
              <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
            </div>
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => onChangeTheme('dark')}
            className={clsx(
              'relative w-24 h-16 p-2 rounded-[6px] flex flex-col justify-between border transition-all bg-[#1C1C24]',
              currentTheme === 'dark' ? 'border-white' : 'border border-[#2C2C38]'
            )}
          >
            {/* CHECK CENTRADO */}
            {currentTheme === 'dark' && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Contenido visual */}
            <div className="space-y-1 z-0">
              <div className="w-4 h-2 rounded-sm bg-[#374151]" />
              <div className="w-3/4 h-3 rounded-sm bg-[#374151]" />
            </div>
            <div className="flex gap-1 justify-start z-0">
              <div className="w-2 h-2 rounded-full bg-[#6B7280]" />
              <div className="w-2 h-2 rounded-full bg-[#6B7280]" />
              <div className="w-2 h-2 rounded-full bg-[#6B7280]" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}