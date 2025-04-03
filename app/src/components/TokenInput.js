'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

const TokenInput = ({ onSubmitToken, error, loading, onBack }) => {
  const inputRefs = useRef([]);
  const [digits, setDigits] = useState(Array(6).fill(''));

  const focusInput = (index) => {
    if (inputRefs.current[index]) inputRefs.current[index].focus();
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^[0-9]{0,6}$/.test(value)) {
      const newDigits = [...digits];

      // Si se pega todo el código de golpe dentro del input (no en clipboard)
      if (value.length === 6) {
        for (let i = 0; i < 6; i++) {
          newDigits[i] = value[i] || '';
        }
        setDigits(newDigits);
        inputRefs.current[5].blur();
        return;
      }

      newDigits[index] = value[value.length - 1] || '';
      setDigits(newDigits);

      if (value && index < 5) focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }

    if (e.key === 'ArrowLeft' && index > 0) focusInput(index - 1);
    if (e.key === 'ArrowRight' && index < 5) focusInput(index + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      const newDigits = paste.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = () => {
    const token = digits.join('');
    if (token.length === 6) {
      onSubmitToken(token);
    }
  };

  useEffect(() => {
    focusInput(0);
  }, []);

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white h-screen">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Image
            src="/logoAdvan.svg"
            alt="Advan Logo"
            width={160}
            height={50}
            className="h-auto"
            priority
          />
        </div>

        <h2 className="text-2xl font-medium text-gray-800 mb-2">
          Autentificación de dos factores
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Ingresa el código de 6 dígitos que recibiste vía correo
        </p>

        {/* Cajas de entrada */}
        <div className="flex justify-between mb-6">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-2">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Continuar */}
        <button
          onClick={handleSubmit}
          disabled={loading || digits.some((d) => !d)}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'Continuar'}
        </button>

        {/* Regresar */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} className="mr-2" />
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
