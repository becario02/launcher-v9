import React, { useEffect, useState } from 'react';
import { X, LogOut, ChevronRight, ChevronUp } from 'lucide-react';

const accounts = [
  { id: 'P2', name: 'PHES 2', email: 'roberto2@phes.mx', color: 'bg-teal-500' },
  { id: 'T1', name: 'TLE 1', email: 'roberto@tle.mx', color: 'bg-blue-500' }
];

const AccountButton = ({ id, name, email, color }) => (
  <button className="w-full p-2.5 flex items-center justify-between rounded-lg hover:bg-gray-50 group">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-sm`}>
        {id}
      </div>
      <div className="text-left">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-gray-500">{email}</div>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
  </button>
);

const ProfilePopup = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showAccounts, setShowAccounts] = useState(true); // Iniciamos con true para mostrar las cuentas

  useEffect(() => {
    let timers = [];
    if (isOpen) {
      setMounted(true);
      timers.push(setTimeout(() => setShowAnimation(true), 50));
    } else {
      setShowAnimation(false);
      timers.push(setTimeout(() => setMounted(false), 200));
      setShowAccounts(true); // Reseteamos a true cuando se cierra para el próximo uso
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 transition-opacity duration-200 z-40
          ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 mt-16 mr-4 w-80 bg-white rounded-xl shadow-xl 
        border border-gray-200 overflow-hidden z-50 transition-all duration-200
        ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="p-6 text-center border-b border-gray-100">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <img src="https://i.pinimg.com/736x/bb/84/e8/bb84e8891c5b8aea249381b5d7c936e5.jpg" alt="Profile" className="rounded-full" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold">Roberto Cruz Valderrabano</h3>
        </div>

        <div className="relative overflow-hidden">
          <button 
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-500">Cambiar de cuenta</span>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 
              ${showAccounts ? 'rotate-0' : 'rotate-180'}`} />
          </button>

          <div className={`transition-all duration-200 ease-in-out origin-top
            ${showAccounts 
              ? 'max-h-48 opacity-100' 
              : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4 space-y-1">
              {accounts.map(account => (
                <AccountButton key={account.id} {...account} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;