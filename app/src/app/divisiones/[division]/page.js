"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  Circle,
  Flag,
  ShoppingCart,
  Calculator,
  Monitor,
  Tool,
  BarChart2,
  Settings,
  User,
} from "lucide-react";
import { usePrimaryColor } from "@/context/primaryColor";
import { useCompany } from "@/context/CompanyContext";
import Notification from "@/components/Notification";
import { useModule } from "@/context/ModuleContext";

const moduleGroupTranslations = {
  OPERATIVES: "nucleares",
  FINANCIAL: "financieros",
  AUXILIARIES: "auxiliares",
};

const divisionNames = {
  nucleares: "Nucleares",
  financieros: "Financieros",
  auxiliares: "Auxiliares",
};

const iconMap = {
  ALMACENES: Tool,
  CONTABILIDAD: BarChart2,
  FACTURACIÓN: Calculator,
  PRESUPUESTOS: Calculator,
  COMPRAS: ShoppingCart,
  COTIZADOR: Calculator,
  VIGILANCIA: Monitor,
  LIQUIDACIONES: Settings,
  TRÁFICO: Flag,
  LLANTAS: Circle,
  RRHH: Circle,
  LEGAL: Circle,
  IT: Settings,
};

export default function DivisionPage() {
  const { division } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { selectedCompany } = useCompany();
  const { setModuleData } = useModule();
  const [modulesByDivision, setModulesByDivision] = useState({});
  const divisionName = divisionNames[division] || division;
  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    message: "",
    style: "toast",
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(
          '/api/modules-company',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idUserCompanyConnection: selectedCompany?.idUserCompanyConnection,
            }),
          }
        );

        const data = await res.json();

        const grouped = {};
        data.data.forEach((mod) => {
          const translatedGroup = moduleGroupTranslations[mod.moduleGroup];
          if (!translatedGroup) return;

          if (!grouped[translatedGroup]) grouped[translatedGroup] = [];

          grouped[translatedGroup].push({
            title: mod.moduleName,
            slug: mod.moduleName.toLowerCase().replace(/\s+/g, "-"),
            version: `${mod.version}.${mod.subversion}.${mod.revision}`,
            isVersionValid: mod.isActive !== false,
            description:
              "Lorem ipsum placerat mi tellus non ac risus facilibus nibh consequat ipsum.",
            icon: iconMap[mod.moduleName.toUpperCase()] || Settings,
            idModule: mod.idModule,
            acronym: mod.acronym,
            exeName: mod.exeName,
            idCompanyModule: mod.idCompanyModule,
          });
        });

        setModulesByDivision(grouped);
      } catch (err) {
        console.error("Error fetching modules:", err);
      }
    };

    if (selectedCompany?.idCompany) {
      fetchModules();
    }
  }, [selectedCompany]);

  const modules = modulesByDivision[division] || [];

  const handleModuleClick = async (division, mod) => {
    try {
      const currentDivisionModules = modulesByDivision[division] || [];
      const currentModule = currentDivisionModules.find(
        (m) => m.slug === mod.slug
      );

      if (!currentModule) {
        showNotification(
          "error",
          "No se pudo encontrar la información del módulo",
          "toast"
        );
        return;
      }


      const moduleData = {
        idCompanyModule: currentModule.idCompanyModule,
        idModule: currentModule.idModule,
        acronym: currentModule.acronym,
        exeName: currentModule.exeName,
        title: currentModule.title,
        division: division,
        slug: mod.slug,
        version: currentModule.version,
        isVersionValid: currentModule.isVersionValid,
        description: currentModule.description,
        timestamp: Date.now(),
      };

      setModuleData(moduleData);

      localStorage.setItem("currentModuleData", JSON.stringify(moduleData));

      window.location.href = `/divisiones/${division}/${mod.slug}`;
    } catch (err) {
      console.error("Error en handleModuleClick:", err);
      showNotification("error", "Ocurrió un error al abrir el módulo", "toast");
    }
  };

  const showNotification = (type, message, style = "toast") => {
    setNotification({
      visible: false,
      type: "info",
      message: "",
      style: "inline",
    });
    setTimeout(
      () => setNotification({ visible: true, type, message, style }),
      50
    );
  };

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, visible: false }));

  return (
    <>
      <div className="flex">
        <div className="hidden md:block">
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

        <div className="flex-1 md:ml-60">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14 overflow-x-hidden">
            {/* Contenedor común para ambos elementos */}
            <div className="mx-4 sm:mx-6 md:mx-12 lg:mx-[60px] xl:mx-[70px]">
              {/* Header de División */}
              <div
                className="rounded-xl relative overflow-hidden mb-6"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                  <div
                    className="absolute rounded-full w-[400px] h-[400px] right-[-100px] top-[-100px] opacity-5"
                    style={{
                      background: `radial-gradient(circle, white 0%, white 100%)`,
                    }}
                  />
                  <div
                    className="absolute rounded-full w-[300px] h-[300px] right-[0px] top-[-50px] opacity-5"
                    style={{
                      background: `radial-gradient(circle, white 0%, white 100%)`,
                    }}
                  />
                  <div
                    className="absolute rounded-full w-[250px] h-[250px] right-[100px] top-[0px] opacity-5"
                    style={{
                      background: `radial-gradient(circle, white 0%, white 100%)`,
                    }}
                  />
                </div>

                <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 h-auto md:h-[150px] flex flex-col justify-center relative z-10">
                  <p className="text-[14px] leading-[21px] font-medium font-poppins text-white mb-1">
                    División
                  </p>
                  <h1 className="text-[24px] leading-[0.75] font-semibold font-poppins text-white">
                    {divisionName}
                  </h1>
                </div>
              </div>

              {/* Grid de Módulos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {modules.map((mod) => (
                  <div
                    key={mod.slug}
                    onClick={() => handleModuleClick(division, mod)}
                    className="block cursor-pointer"
                  >
                    <ModuleCard
                      title={mod.title}
                      description={mod.description}
                      Icon={mod.icon}
                      version={mod.version}
                      isVersionValid={mod.isVersionValid}
                    />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {notification.visible && notification.style === "toast" && (
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
    </>
  );
}

function ModuleCard({
  title,
  description,
  Icon,
  version,
  isVersionValid = true,
}) {
  const IconComponent = Icon || Settings;
  const { primaryColor } = usePrimaryColor();

  return (
    <div className="bg-white dark:bg-[#1C1C24] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2C2C38] p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-3">
          <div style={{ color: primaryColor }}>
            <IconComponent className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Versión
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {version}
          </span>
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              isVersionValid ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-p flex-grow">
          {description}
        </p>
      </div>
    </div>
  );
}