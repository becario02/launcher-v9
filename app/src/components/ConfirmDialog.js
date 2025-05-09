import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import clsx from 'clsx';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false
}) {
  const { primaryColor } = usePrimaryColor();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-[#1C1C24] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  {danger ? (
                    <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/20 rounded-full p-2">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 rounded-full p-2" style={{ backgroundColor: `${primaryColor}20` }}>
                      <AlertTriangle className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                  )}
                  
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#262631] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C38] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-[#1C1C24]"
                    onClick={onCancel}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className={clsx(
                      "inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#1C1C24]",
                      danger 
                        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
                        : "focus:ring-primary hover:bg-opacity-90"
                    )}
                    style={danger ? {} : { backgroundColor: primaryColor }}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}