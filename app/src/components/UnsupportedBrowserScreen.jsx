'use client';

import Image from 'next/image';

const UnsupportedBrowserScreen = () => {
  const handleDownloadChrome = () => {
    window.open('https://www.google.com/chrome/', '_blank');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 text-center">
        <div className="mb-6">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
            className="h-auto mx-auto"
            priority
          />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Navegador no compatible</h2>
        <p className="text-gray-600 mb-6">
          Esta aplicación solo es compatible con Google Chrome. 
          Por favor, usa Chrome para continuar.
        </p>
        
        <button
          onClick={handleDownloadChrome}
          className="block w-full bg-[#0080ff] text-white py-3 rounded-md hover:bg-blue-600 transition-colors text-center mb-4"
        >
          Descargar Google Chrome
        </button>
        
        <p className="text-gray-500 text-sm">
          Una vez instalado, regresa a esta página para continuar
        </p>
      </div>
    </div>
  );
};

export default UnsupportedBrowserScreen;