export default function CompanyCards({ companies, openCompanies, setOpenCompanies }) {
  const toggleCompany = (companyId) => {
    setOpenCompanies((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  };

  return (
    <div className="w-full flex-1 min-w-0"> {/* min-w-0 previene que el contenido cause overflow */}
      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-white dark:bg-[#1c1c24] rounded-lg border border-[#E6E8EC] dark:border-[#2C2C38] h-full w-full min-w-0">
          <p className="text-[#92929D] dark:text-[#A0A0AB] text-sm">
            🧐 Upps... no se encontraron resultados con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-[#1c1c24] rounded-[6px] px-4 py-3 border border-[#E6E8EC] dark:border-[#2C2C38] w-full"
            >
              {/* Encabezado */}
              <div
                onClick={() => toggleCompany(company.id)}
                className="cursor-pointer flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#696974] dark:text-[#A0A0AB]">
                    {openCompanies.includes(company.id) ? '▼' : '▶'}
                  </span>
                  <span className="text-[#0080FF]">🏢</span>
                  <div>
                    <div className="font-semibold text-[#171725] dark:text-white">
                      {company.name}
                    </div>
                    <div className="text-sm text-[#696974] dark:text-[#A0A0AB]">
                      {company.totalConnections} total connections
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="border border-[#00B67A] text-[#00B67A] px-2 py-1 rounded-[4px]">
                    {company.availableConnections.length} Available
                  </span>
                  <span className="border border-[#0080FF] text-[#0080FF] px-2 py-1 rounded-[4px]">
                    {company.assignedConnections.length} Assigned
                  </span>
                </div>
              </div>

              {/* Expandido */}
              {openCompanies.includes(company.id) && (
                <div className="mt-4 space-y-4">
                  {/* Available */}
                  <div>
                    <p className="text-[14px] font-semibold text-[#00B67A] mb-1">
                      🟢 Available Connections
                    </p>
                    {company.availableConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex justify-between items-center bg-[#F9FAFB] dark:bg-[#2C2C38] px-4 py-3 rounded border border-[#E6E8EC] dark:border-[#353542]"
                      >
                        <div>
                          <p className="text-[#171725] dark:text-white font-medium">{conn.name}</p>
                          <p className="text-sm text-[#92929D] dark:text-[#A0A0AB]">
                            {conn.type} • Last sync: {conn.lastSync}
                          </p>
                        </div>
                        <span className="bg-[#00B67A] text-white text-xs px-2 py-1 rounded">
                          {conn.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned */}
                  <div>
                    <p className="text-[14px] font-semibold text-[#0080FF] mb-1">
                      🔵 Assigned Connections
                    </p>
                    {company.assignedConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex justify-between items-center bg-[#F9FAFB] dark:bg-[#2C2C38] px-4 py-3 rounded border border-[#E6E8EC] dark:border-[#353542]"
                      >
                        <div>
                          <p className="text-[#171725] dark:text-white font-medium">{conn.name}</p>
                          <p className="text-sm text-[#92929D] dark:text-[#A0A0AB]">
                            {conn.type} • Assigned to: {conn.assignedTo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 border border-[#0080FF] text-[#0080FF] rounded text-xs hover:bg-[#EFF6FF] dark:hover:bg-[#353542]">
                            Transfer
                          </button>
                          <button className="px-2 py-1 border border-red-500 text-red-500 rounded text-xs hover:bg-[#FFF5F5] dark:hover:bg-[#3f2d2d]">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}