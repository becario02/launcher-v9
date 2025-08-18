"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCompany } from "@/context/CompanyContext";

export default function CompanySelector() {
  const [open, setOpen] = useState(false);
  const [showSingleMessage, setShowSingleMessage] = useState(false);
  const dropdownRef = useRef(null);

  const {
    companies,
    selectedCompany,
    openCompanySelector,
    setPreselectedCompany,
    loading,
  } = useCompany();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowSingleMessage(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateKey = (c) => `${c.name}-${c.serverErpDb}-${c.nameErpDb}`;
  const selectedKey = selectedCompany ? generateKey(selectedCompany) : null;

  const getCompanyLogo = (company) => {
    if (company?.logo) {
      return `data:image/png;base64,${company.logo}`;
    }
    return null;
  };

  const CompanyLogo = ({ company, size = 36 }) => {
    const logoSrc = getCompanyLogo(company);

    if (logoSrc) {
      return (
        <Image
          src={logoSrc}
          alt={`${company.name} logo`}
          width={size}
          height={size}
          className="object-contain rounded-full"
          onError={(e) => {
            e.target.style.display = "none";
            if (e.currentTarget && e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerHTML = `<span class="text-[13px] font-medium text-[#0080FF] dark:text-white">${company.name.charAt(
                0
              )}</span>`;
            }
          }}
        />
      );
    }

    return (
      <span className="text-[13px] font-medium text-[#0080FF] dark:text-white">
        {company.name.charAt(0)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200">
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200">
        <button
          onClick={openCompanySelector}
          className="w-full flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all"
        >
          <span>Seleccionar empresa</span>
          <Image
            src="/assets/company-selector/icon-expand.svg"
            alt="Expand"
            width={16}
            height={16}
            className="dark:invert"
          />
        </button>
      </div>
    );
  }

  const handleSelectorClick = () => {
    if (companies.length > 1) {
      setOpen(!open);
      setShowSingleMessage(false);
    } else {
      setShowSingleMessage(!showSingleMessage);
      setOpen(false);
    }
  };

  function formatServer(server) {
    if (!server) return "";
    let hostPart = server;
    let portOrInstance = "";
    if (server.includes(":")) {
      [hostPart, portOrInstance] = server.split(":");
      portOrInstance = ":" + portOrInstance;
    } else if (server.includes("\\")) {
      [hostPart, portOrInstance] = server.split("\\");
      portOrInstance = "\\" + portOrInstance;
    }
    const parts = hostPart.split(".");
    const last = parts.pop();
    const maskedParts = parts.map((part) => "*".repeat(part.length));
    return maskedParts.concat(last).join(".") + portOrInstance;
  }

  const filteredCompanies = (companies || [])
    .filter(
      (c, i, arr) =>
        arr.findIndex((x) => generateKey(x) === generateKey(c)) === i
    )
    .filter((c) => generateKey(c) !== selectedKey);

  const MAX_DISPLAYED = 5;
  const shownCompanies = filteredCompanies.slice(0, MAX_DISPLAYED);
  const extraCount = filteredCompanies.length > MAX_DISPLAYED ? filteredCompanies.length - MAX_DISPLAYED : 0;

  return (
    <div
      ref={dropdownRef}
      className="font-[Poppins] relative w-[567px] text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      <button
        onClick={handleSelectorClick}
        className={`w-full flex items-center justify-between ${
          open || showSingleMessage
            ? "border border-[var(--primary-color)] border-b-transparent rounded-t-lg"
            : "border border-gray-300 dark:border-gray-600 rounded-lg"
        } px-3 py-2 bg-white dark:bg-[#1c1c24] hover:bg-gray-50 dark:hover:bg-[#2c2c38] transition-all`}
        aria-label={`Selected company: ${selectedCompany.name}`}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-[50px] bg-white dark:bg-primary border border-gray-200 dark:border-gray-600 overflow-hidden">
              <CompanyLogo company={selectedCompany} size={36} />
            </div>
          </div>

          <div className="flex flex-col items-start flex-grow overflow-hidden">
            <div className="flex items-center w-full">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {selectedCompany.name}
              </span>
            </div>
            <div className="flex items-center w-full text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">
                  {formatServer(selectedCompany.serverErpDb)}
                </span>
                <span className="whitespace-nowrap">•</span>
                <span className="whitespace-nowrap">
                  {selectedCompany.nameErpDb}
                </span>
              </div>

              <div className="flex-grow"></div>

              <div className="flex-shrink-0">
                <span
                  className={`inline-flex px-2 py-0.5 text-white text-[10px] rounded-[25px] whitespace-nowrap font-medium ${
                    selectedCompany.environment === "TEST"
                      ? "bg-gray-500 dark:bg-gray-600"
                      : "bg-primary"
                  }`}
                >
                  {selectedCompany.environment === "TEST"
                    ? "PRUEBAS"
                    : "PRODUCCIÓN"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Image
              src={
                open || showSingleMessage
                  ? "/assets/company-selector/icon-contrae-2.svg"
                  : "/assets/company-selector/icon-expand.svg"
              }
              alt="Toggle"
              width={16}
              height={16}
              className="dark:invert"
            />
          </div>
        </div>
      </button>

      {showSingleMessage && (
        <div className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10 p-3 text-center">
          <p className="text-[14px] text-gray-700 dark:text-gray-200">
            Solo tienes acceso a esta empresa
          </p>
        </div>
      )}

      {open && companies.length > 1 && (
        <ul className="absolute top-full w-full bg-white dark:bg-[#1c1c24] border border-[var(--primary-color)] border-t-0 rounded-b-lg shadow z-10">
          {shownCompanies.map((company) => {
            return (
              <li
                key={generateKey(company)}
                onClick={() => {
                  setPreselectedCompany(company);
                  openCompanySelector();
                  setOpen(false);
                }}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2c2c38] flex items-center gap-2"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0080FF]/10 dark:bg-primary text-[#0080FF] dark:text-white border overflow-hidden">
                  <CompanyLogo company={company} size={36} />
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200">
                    {company.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {formatServer(company.serverErpDb)} • {company.nameErpDb}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-white text-[10px] rounded-[25px] flex-shrink-0 font-medium ${
                        company.environment === "TEST"
                          ? "bg-gray-500 dark:bg-gray-600"
                          : "bg-primary"
                      }`}
                    >
                      {company.environment === "TEST"
                        ? "PRUEBAS"
                        : "PRODUCCIÓN"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}

          {extraCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setPreselectedCompany(null);
                openCompanySelector();
                setOpen(false);
              }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-white text-[12px] font-semibold flex items-center justify-center shadow-sm hover:scale-[1.04] transition"
              aria-label={`Ver ${extraCount} empresas más`}
              title={`Ver ${extraCount} empresas más`}
            >
              +{extraCount}
            </button>
          )}
        </ul>
      )}
    </div>
  );
}