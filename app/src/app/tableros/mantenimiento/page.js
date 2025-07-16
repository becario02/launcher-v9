"use client";

import { useState } from "react";
import Calendario from "@/components/tableros/Calendario/Calendario";
import CardCalendario from "@/components/tableros/Calendario/CardCalendario";
import InsumosPieChart from "@/components/tableros/Calendario/InsumosPieChart";

const MaintenanceDashboard = () => {
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pb-14 px-4 md:px-8 xl:px-10 w-full font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 items-start">
          <div className="w-full max-w-[300px] flex flex-col justify-between h-full">
            <div className="mb-6">
              <InsumosPieChart />
            </div>
            <div className="mt-5">
              <CardCalendario
                selectedStatuses={selectedStatuses}
                onToggleStatus={toggleStatus}
              />
            </div>
          </div>
          <div className="flex-1">
            <Calendario selectedStatuses={selectedStatuses} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MaintenanceDashboard;