import { Check } from 'lucide-react';
import clsx from 'clsx';

export default function PrimaryColorSettings({ colorOptions, primaryColor, onChangeColor }) {
  return (
    <div className="flex flex-col md:flex-row gap-10 mt-8">
      <div className="w-full md:w-60 pt-2">
        <h3 className="text-[14px] font-medium text-[#000] dark:text-[#e2e2ea]">Color de tema</h3>
        <p className="text-[12px] text-[#696974] dark:text-[#92929d] mt-1">Elige un tema preferido para la app.</p>
      </div>
      <div className="flex-1">
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm flex gap-3">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => onChangeColor(color)}
              className={clsx(
                'w-8 h-8 rounded-md flex items-center justify-center relative',
                primaryColor === color && 'ring-2 ring-white'
              )}
              style={{ backgroundColor: color }}
            >
              {primaryColor === color && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}