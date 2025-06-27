"use client";
import Calendario from "@/components/tableros/Calendario/Calendario";
import CardCalendario from "@/components/tableros/Calendario/CardCalendario";
import InsumosPieChart from "@/components/tableros/Calendario/InsumosPieChart";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { BarChart3 } from "lucide-react";

const MaintenanceDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex font-poppins">
      <div className="hidden md:block fixed z-10 h-full">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}
      <div className="flex-1 w-full md:pl-60">
        <Navbar
          className="sticky top-0 z-30"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 px-4 md:px-8 xl:px-10 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 pl-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
                  Órdenes de Trabajo - Programa de Mantenimiento
                </h1>
              </div>
              <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
                Seguimiento y control de órdenes de trabajo programadas con
                visualización de calendario.
              </p>
            </div>

            <div className="flex gap-2 items-start">
              {" "}
              {/* Usa gap-4 o el valor que se vea mejor */}
              <div className="w-full max-w-[300px] pl-6 flex flex-col justify-between h-full">
                <div className="mb-6">
                  <InsumosPieChart />
                </div>
                <div className="mt-5">
                  <CardCalendario />
                </div>
              </div>
              <div className="flex-1">
                <Calendario />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
