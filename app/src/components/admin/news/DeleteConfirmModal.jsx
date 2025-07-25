'use client';

export default function DeleteConfirmModal({ isOpen, onCancel, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#1C1C24] rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-[#FFEFEF] dark:bg-[#402020] rounded-full p-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500"
            >
              <path
                d="M14 11v6M10 11v6M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M4 7h16M7 7l2-4h6l2 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-h3 font-regular text-gray-800 dark:text-gray-100">
            ¿Eliminar noticia?
          </h2>
        </div>

        <p className="text-p font-regular text-gray-600 dark:text-gray-400 mb-4">
          Estás a punto de eliminar esta noticia. Esta acción no se puede deshacer.
        </p>

        <p className="text-p text-gray-600 dark:text-gray-400 font-regular mb-6">
          ¿Estás seguro de continuar?
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-p rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-5 py-2 rounded-md text-white flex items-center text-p justify-center gap-2 ${
              isDeleting ? "bg-primary cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isDeleting && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            )}
            {isDeleting ? "Eliminando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
