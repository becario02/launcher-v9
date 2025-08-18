"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import Header from "@/components/admin/conexionesErp/Header";
import SearchAndFilter from "@/components/admin/conexionesErp/SearchAndFilter";
import CompanyCards from "@/components/admin/conexionesErp/CompanyCards";
import UserSlider from "@/components/admin/conexionesErp/UserConexiones";

export default function ConexionesErp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    message: "",
    style: "inline",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [openCompanies, setOpenCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vista, setVista] = useState("empresas");
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchUsers(setUsers);
  }, []);

  const fetchConnections = async () => {
    try {
      setLoadingData(true);
      const res = await fetch("/api/conexionesErp");
      const json = await res.json();

      if (json.statusCode !== "200")
        throw new Error(json.message || "Error al obtener datos");

      const grouped = {};
      json.data.forEach((conn) => {
        const companyId = conn.idCompany;
        if (!grouped[companyId]) {
          grouped[companyId] = {
            id: companyId,
            name: conn.name,
            companyIdentifier: conn.companyIdentifier,
            totalConnections: 0,
            availableConnections: [],
            assignedConnections: [],
          };
        }

        const key = `${conn.nameErpDb}-${conn.serverErpDb}-${conn.environment}`;
        const exists = grouped[companyId].availableConnections.some(
          (c) =>
            c.name === conn.nameErpDb &&
            c.server === conn.serverErpDb &&
            c.environment === conn.environment
        );

        if (!exists) {
          grouped[companyId].availableConnections.push({
            id: conn.idUserCompanyConnection,
            name: conn.nameErpDb,
            server: conn.serverErpDb,
            environment: conn.environment,
          });
        }

        grouped[companyId].totalConnections++;
      });

      setCompanies(Object.values(grouped));
      setOpenCompanies([]);
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        visible: true,
        type: "error",
        message: "No se pudieron cargar las conexiones ERP.",
        style: "toast",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async (setUsers) => {
    try {
      setLoadingData(true);
      const res = await fetch("/api/conexionesErp/users");
      const json = await res.json();
      const grouped = json.data.reduce((acc, conn) => {
        const existing = acc.find((u) => u.idUser === conn.idUser);
        const connection = {
          id: conn.idUserCompanyConnection,
          db: conn.nameErpDb,
          server: conn.serverErpDb,
          env: conn.environment,
          company: conn.name,
          companyIdentifier: conn.companyIdentifier,
        };

        if (existing) {
          existing.connections.push(connection);
        } else {
          acc.push({
            idUser: conn.idUser,
            fullname: conn.fullname,
            email: conn.email,
            connections: [connection],
          });
        }
        return acc;
      }, []);
      setUsers(grouped);
    } catch (error) {
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteErpConnection = async (connToDelete, currentUserId) => {
    if (!connToDelete) return;

    try {
      const res = await fetch("/api/conexionesErp/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idUserCompanyConnection: connToDelete.id }),
      });

      const json = await res.json();

      if (json.statusCode !== "200") {
        throw new Error(json.message || "No se pudo eliminar la conexión.");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.idUser === currentUserId
            ? {
                ...user,
                connections: user.connections.filter(
                  (c) => c.id !== connToDelete.id
                ),
              }
            : user
        )
      );

      setNotification({
        visible: true,
        type: "success",
        message: `Conexión ERP eliminada correctamente.`,
        style: "toast",
      });
    } catch (error) {
      setNotification({
        visible: true,
        type: "error",
        message: "Error al eliminar la conexión ERP.",
        style: "toast",
      });
    }
  };

  const handleAssignConnection = async (userIds, connection) => {
    try {
      for (const idUser of userIds) {
        const user = users.find((u) => u.idUser === idUser);
        if (!user) continue;

        const payload = {
          idUser,
          username: user.fullname,
          idCompany:
            companies.find((c) =>
              c.availableConnections?.some((conn) => conn.id === connection.id)
            )?.id || 0,
          serverErpDb: connection.server,
          nameErpDb: connection.name,
          environment: connection.environment,
        };

        const response = await fetch("/api/conexionesErp/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al asignar conexión");
        }
      }

      await fetchConnections();
      await fetchUsers(setUsers);

      setNotification({
        visible: true,
        type: "success",
        message: `Conexión asignada exitosamente.`,
        style: "toast",
      });
    } catch (err) {
      setNotification({
        visible: true,
        type: "error",
        message: "Error del servidor al asignar conexión",
        style: "toast",
      });
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      (selectedCompany === "all" ||
        company.id.toString() === selectedCompany) &&
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalConnections = companies.reduce(
    (sum, company) => sum + company.totalConnections,
    0
  );

  const closeNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1c1c24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-white dark:bg-[#1c1c24] pt-0 w-full text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 h-full min-w-0 w-full">
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
            {notification.visible && notification.style === "inline" && (
              <Notification
                visible
                type={notification.type}
                message={notification.message}
                style="inline"
                onClose={closeNotification}
              />
            )}

            <div className="space-y-6 h-full flex flex-col w-full min-w-0">
              <Header totalConnections={totalConnections} />

              {/* 🔁 Botones para cambiar vista */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setVista("empresas")}
                  className={`px-4 py-1 rounded-full text-sm border ${
                    vista === "empresas"
                      ? "bg-primary text-white border-primary"
                      : "bg-transparent text-primary border-primary"
                  }`}
                >
                  Ver por empresa
                </button>
                <button
                  onClick={() => setVista("usuarios")}
                  className={`px-4 py-1 rounded-full text-sm border ${
                    vista === "usuarios"
                      ? "bg-primary text-white border-primary"
                      : "bg-transparent text-primary border-primary"
                  }`}
                >
                  Ver por usuario
                </button>
              </div>

              {vista === "empresas" && (
                <>
                  <SearchAndFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    companies={companies}
                    showCompanyFilter={true}
                    placeholder="Buscar por empresa..."
                  />

                  <div className="flex-1 w-full min-w-0">
                    <CompanyCards
                      companies={filteredCompanies}
                      openCompanies={openCompanies}
                      setOpenCompanies={setOpenCompanies}
                      users={users}
                      handleAssign={handleAssignConnection}
                      loading={loadingData}
                    />
                  </div>
                </>
              )}

              {vista === "usuarios" && (
                <>
                  <SearchAndFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showCompanyFilter={false}
                    placeholder="Buscar por usuario..."
                  />

                  <div className="flex-1 w-full min-w-0">
                    <UserSlider
                      users={users.filter((user) => {
                        const matchesSearch =
                          user.fullname
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          user.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());

                        return matchesSearch;
                      })}
                      setUsers={setUsers}
                      handleDelete={handleDeleteErpConnection}
                      loading={loadingData}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
