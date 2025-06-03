'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import ChangeErpPasswordModal from '@/components/profile/settings/ChangeErpPasswordModal';
import Notification from '@/components/Notification';

export default function ConnectionsSettings() {
  const { companies } = useCompany();
  const [expanded, setExpanded] = useState({});
  const [modalData, setModalData] = useState(null); // contiene los datos de la conexión seleccionada
  const [notification, setNotification] = useState({
    visible: false,
    type: 'success',
    message: '',
    style: 'toast'
  });

  const showNotification = (type, message, style = 'toast') => {
    setNotification({ visible: false, type: 'info', message: '', style: 'inline' });
    setTimeout(() => {
      setNotification({ visible: true, type, message, style });
    }, 50);
  };

  const closeNotification = () =>
    setNotification(prev => ({ ...prev, visible: false }));

  const formatServer = (server) => {
    if (!server) return '';
    let hostPart = server;
    let portOrInstance = '';
    if (server.includes(':')) {
      [hostPart, portOrInstance] = server.split(':');
      portOrInstance = ':' + portOrInstance;
    } else if (server.includes('\\')) {
      [hostPart, portOrInstance] = server.split('\\');
      portOrInstance = '\\' + portOrInstance;
    }
    const parts = hostPart.split('.');
    const last = parts.pop();
    const maskedParts = parts.map(part => '*'.repeat(part.length));
    return maskedParts.concat(last).join('.') + portOrInstance;
  };

  if (!companies || companies.length === 0) return null;

  // Agrupar por nombre de empresa
  const grouped = companies.reduce((acc, c) => {
    acc[c.name] = acc[c.name] ? [...acc[c.name], c] : [c];
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="w-full md:w-60 pt-2">
        <h3 className="text-[14px] font-medium text-[#000] dark:text-[#e2e2ea]">Conexiones ERP</h3>
        <p className="text-[12px] text-[#696974] dark:text-[#92929d] mt-1">
          Lista agrupada de conexiones al ERP por empresa.
        </p>
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-4">
          {Object.entries(grouped).map(([empresa, conexiones]) => (
            <div key={empresa}>
              {/* Encabezado del grupo */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [empresa]: !prev[empresa] }))}
                className="w-full flex items-center justify-between py-2 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition"
              >
                <div className="text-left">
                  <p className="text-[14px] font-medium text-gray-800 dark:text-white">
                    {empresa}
                  </p>
                  <p className="text-[13px] text-gray-600 dark:text-gray-400">
                    {conexiones.length} conexión{conexiones.length > 1 ? 'es' : ''}
                  </p>
                </div>
                {expanded[empresa] ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {/* Conexiones individuales */}
              {expanded[empresa] && (
                <div className="mt-2 space-y-4">
                  {conexiones.map((company, index) => (
                    <div
                      key={`${company.name}-${index}`}
                      className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-gray-200 dark:border-[#2C2C38] pt-4"
                    >
                      <div className="space-y-1 text-sm">
                        <p className="text-[13px] text-gray-600 dark:text-gray-400">Servidor</p>
                        <p className="text-[14px] text-gray-700 dark:text-gray-300">
                          {formatServer(company.serverErpDb)}
                        </p>

                        <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">Base de datos</p>
                        <p className="text-[14px] text-gray-700 dark:text-gray-300">
                          {company.nameErpDb}
                        </p>

                        <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">Usuario ERP</p>
                        <p className="text-[14px] text-gray-700 dark:text-gray-300">
                          {company.userErpDb}
                        </p>
                      </div>

                      <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0 self-start md:self-center">
                        <button
                          onClick={() =>
                            setModalData({
                              companyName: company.name,
                              userErpDb: company.userErpDb,
                              serverErpDb: company.serverErpDb,
                              nameErpDb: company.nameErpDb,
                              idUserCompany: company.idUserCompany,
                            })
                          }
                          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar contraseña
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de cambio de contraseña ERP */}
      {modalData && (
        <ChangeErpPasswordModal
          {...modalData}
          onClose={() => setModalData(null)}
          showNotification={showNotification}
          onSave={(formData) => {
            setModalData(null);
          }}
        />
      )}

      {notification.visible && notification.style === 'toast' && (
        <div className="fixed top-4 right-4 z-[9999]">
          <Notification
            visible
            type={notification.type}
            message={notification.message}
            style="toast"
            onClose={closeNotification}
          />
        </div>
      )}
    </div>
  );
}