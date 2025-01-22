import React, { useState } from 'react';
import { Mail, Database, Server } from 'lucide-react';

const FormRecuperarContraseña = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    server: '',
    database: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl px-12 py-8">
        <div className="relative">
          <h2 className="text-sky-600 text-2xl font-semibold text-center mb-8">
            Ingresa la información
          </h2>

          <button 
            onClick={onClose}
            className="absolute top-1 right-2 text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xs mx-auto space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-2xl focus:outline-none text-gray-600"
              required
            />
          </div>

          <div className="relative">
            <Server className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="server"
              value={formData.server}
              onChange={handleChange}
              placeholder="Servidor"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-2xl focus:outline-none text-gray-600"
              required
            />
          </div>

          <div className="relative">
            <Database className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="database"
              value={formData.database}
              onChange={handleChange}
              placeholder="Base de datos"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-2xl focus:outline-none text-gray-600"
              required
            />
          </div>

          <div className="flex justify-center mt-8">
            <button 
              type="submit"
              className="bg-sky-600 text-white rounded-full py-2 px-12 hover:bg-sky-700 transition-colors text-base"
            >
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormRecuperarContraseña;