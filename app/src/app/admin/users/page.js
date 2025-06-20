"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { User, PlusCircle, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePrimaryColor } from "@/context/primaryColor";
import UserFormModal from "@/components/UserFormModal";
import Notification from "@/components/Notification";
import UserTable from "@/components/admin/users/UserTable";
import SelectCompanyModal from "@/components/admin/users/SelectCompanyModal";
import UserHeader from "@/components/admin/users/UserHeader";

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const [advanUsers, setAdvanUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    type: "success",
    message: "",
    style: "toast",
  });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [customOptionsData, setCustomOptionsData] = useState({
    custom: [],
    dashboards: [],
  });

  const fetchCustomAndDashboard = async () => {
    try {
      const response = await axios.get("/api/custom-and-dashboard");
      const data = response.data?.data || { custom: [], dashboards: [] };
      setCustomOptionsData(data);
    } catch (error) {
      console.error(
        "Error al obtener opciones personalizadas y dashboards:",
        error
      );
    }
  };

  const fetchCompanies = () => {
    setIsLoading(true);
    axios
      .get("/api/users")
      .then((res) => {
        setCompanies(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const fetchAdvanUsers = () => {
    setIsLoading(true);
    axios
      .get("/api/users/advan")
      .then((res) => {
        setAdvanUsers(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAdvanUsers();
    fetchCompanies();
    fetchCustomAndDashboard();
  }, []);

  useEffect(() => {
    const profile = Cookies.get("profileName");
    const companyName = Cookies.get("companyName");
    setProfileName(profile);

    if (profile === "ADMINADVAN") {
      setShowCompanyModal(true);
    } else {
      if (companyName) {
        const companyFound = companies.find(
          (c) => c.companyName === companyName
        );
        if (companyFound) {
          let filteredUsers = companyFound.users || [];
          if (profile === "ADMINADVAN") {
            filteredUsers = filteredUsers.filter((u) =>
              u.profileName.includes("ADMIN")
            );
          }
          setSelectedCompany(companyFound);
          setUsers(filteredUsers);
          setTotalUsers(filteredUsers.length);
        } else {
          console.warn(`Empresa no encontrada: ${companyName}`);
        }
      } else {
        console.warn("No se encontró la cookie companyName");
      }
    }
  }, [companies]);

  const handleSelectCompany = (company) => {
    let filteredUsers = [];

    if (company?.isAdvan) {
      filteredUsers = advanUsers;
      setSelectedCompany({ companyName: "Usuarios Advan" });
    } else {
      filteredUsers = company.users || [];
      if (profileName === "ADMINADVAN") {
        filteredUsers = filteredUsers.filter((u) =>
          u.profileName?.toUpperCase().includes("ADMIN")
        );
      }
      setSelectedCompany(company);
    }

    setUsers(filteredUsers);
    setTotalUsers(filteredUsers.length);
    setShowCompanyModal(false);
    setPage(1);
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

  const handleUserSubmit = async (data) => {
    try {
      if (editingUser) {
        const response = await axios.put("/api/users", {
          idUser: editingUser.idUser,
          ...data,
        });

        if (response.data?.statusCode === "409") {
          showNotification(
            "error",
            response.data.message || "El nombre de usuario ya está en uso",
            "toast"
          );
          return;
        }

        showNotification(
          "success",
          "Usuario actualizado exitosamente",
          "toast"
        );
      } else {
        const response = await axios.post("/api/users", data);

        if (response.data?.statusCode === "409") {
          showNotification(
            "error",
            response.data.message || "El nombre de usuario ya está en uso",
            "toast"
          );
          return;
        }

        showNotification("success", "Usuario creado exitosamente", "toast");
      }

      setModalOpen(false);
      setEditingUser(null);

      const updatedResponse = await axios.get("/api/users/advan");
      const updatedUsers = updatedResponse.data?.data || [];
      setAdvanUsers(updatedUsers);
      setUsers(updatedUsers);
      setTotalUsers(updatedUsers.length);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      showNotification("error", "Error al guardar el usuario.", "toast");
      setModalOpen(false);
      setEditingUser(null);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const toggleConnectionsVisibility = (userId, companyIndex) => {
    setExpandedCompanies((prev) => {
      const key = `${userId}-${companyIndex}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const isCompanyExpanded = (userId, companyIndex) => {
    const key = `${userId}-${companyIndex}`;
    return !!expandedCompanies[key];
  };

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
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col gap-4">
              <UserHeader
                selectedCompany={selectedCompany}
                profileName={profileName}
                onChangeCompany={() => setShowCompanyModal(true)}
                onAddUser={() => {
                  setEditingUser(null);
                  setModalOpen(true);
                }}
                primaryColor={primaryColor}
                users={users}
                customOptions={customOptionsData.custom}
                dashboards={customOptionsData.dashboards}
              />

              {selectedCompany ? (
                <>
                  <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, correo o usuario..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-10 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2C2C38] bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary"
                    />
                    {search && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <UserTable
                    users={users}
                    selectedCompany={selectedCompany}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    totalUsers={totalUsers}
                    search={search}
                    onPageChange={setPage}
                    expandedCompanies={expandedCompanies}
                    toggleConnectionsVisibility={toggleConnectionsVisibility}
                    isCompanyExpanded={isCompanyExpanded}
                    onEditUser={(user) => {
                      setEditingUser(user);
                      setModalOpen(true);
                    }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
                    No se ha seleccionado una empresa
                  </p>
                  {profileName === "ADMINADVAN" && (
                    <button
                      onClick={() => setShowCompanyModal(true)}
                      className="px-6 py-2 rounded-md text-sm font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Seleccionar empresa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <UserFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUserSubmit}
          initialData={editingUser}
        />

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

        <SelectCompanyModal
          isOpen={showCompanyModal}
          companies={companies}
          isLoading={isLoading}
          onSelect={handleSelectCompany}
          onClose={() => setShowCompanyModal(false)}
        />
      </div>
    </div>
  );
}
