"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import Header from "@/components/admin/conexionesErp/Header";
import SearchAndFilter from "@/components/admin/conexionesErp/SearchAndFilter";
import CompanyCards from "@/components/admin/conexionesErp/CompanyCards";

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
  const [openCompanies, setOpenCompanies] = useState([1, 2]);

  const companies = [
    {
      id: 1,
      name: "Acme Corporation",
      totalConnections: 12,
      availableConnections: [
        {
          id: 1,
          name: "SAP Production",
          type: "SAP",
          status: "active",
          lastSync: "2024-01-15",
        },
        {
          id: 2,
          name: "Oracle Financials",
          type: "Oracle",
          status: "active",
          lastSync: "2024-01-14",
        },
        {
          id: 3,
          name: "Salesforce CRM",
          type: "Salesforce",
          status: "inactive",
          lastSync: "2024-01-10",
        },
      ],
      assignedConnections: [
        {
          id: 4,
          name: "SAP HR",
          type: "SAP",
          assignedTo: "John Doe",
          userId: 1,
          lastSync: "2024-01-15",
        },
        {
          id: 5,
          name: "NetSuite ERP",
          type: "NetSuite",
          assignedTo: "Jane Smith",
          userId: 2,
          lastSync: "2024-01-14",
        },
      ],
    },
    {
      id: 2,
      name: "TechStart Inc",
      totalConnections: 8,
      availableConnections: [
        {
          id: 6,
          name: "QuickBooks Online",
          type: "QuickBooks",
          status: "active",
          lastSync: "2024-01-13",
        },
        {
          id: 7,
          name: "Xero Accounting",
          type: "Xero",
          status: "active",
          lastSync: "2024-01-12",
        },
      ],
      assignedConnections: [
        {
          id: 8,
          name: "HubSpot CRM",
          type: "HubSpot",
          assignedTo: "Mike Johnson",
          userId: 3,
          lastSync: "2024-01-11",
        },
      ],
    },
  ];

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@acme.com",
      role: "Manager",
      connectionsCount: 3,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@acme.com",
      role: "Analyst",
      connectionsCount: 2,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@techstart.com",
      role: "Developer",
      connectionsCount: 1,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@acme.com",
      role: "Admin",
      connectionsCount: 0,
    },
  ];

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
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
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

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-white dark:bg-[#1c1c24] pt-0 w-full text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 h-full min-w-0 w-full">
            {/* Notificaciones */}
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

            {/* ERP UI Components */}
            <div className="space-y-6 h-full flex flex-col w-full min-w-0">
              <div className="w-full min-w-0">
                <Header totalConnections={totalConnections} />
              </div>
              <div className="w-full min-w-0">
                <SearchAndFilter
                  companies={companies}
                  searchTerm={searchTerm}
                  selectedCompany={selectedCompany}
                  setSearchTerm={setSearchTerm}
                  setSelectedCompany={setSelectedCompany}
                />
              </div>
              <div className="flex-1 w-full min-w-0">
                <CompanyCards
                  companies={filteredCompanies}
                  openCompanies={openCompanies}
                  setOpenCompanies={setOpenCompanies}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}