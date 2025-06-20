"use client";

import { Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const isoString = dateString.endsWith('Z') || dateString.includes('+')
    ? dateString
    : dateString + 'Z';
  const date = new Date(isoString);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  return `${capitalizedDay} ${day} de ${month} de ${year}`;
};

const formatHour = (dateString) => {
  if (!dateString) return '';
  const isoString = dateString.endsWith('Z') || dateString.includes('+')
    ? dateString
    : dateString + 'Z';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City'
  });
};

function Skeleton() {
  return (
    <div className="w-full sm:w-auto p-[10px] rounded-[10px] border border-[#E6E8EC] dark:border-[#2C2C38] font-poppins flex flex-col justify-between overflow-hidden min-w-0 lg:mt-2 animate-pulse">
      <span className="text-[10px] text-[#696974] dark:text-gray-400 font-normal leading-[15px]">
        Última sesión
      </span>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-x-2 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] min-w-0">
          <Calendar size={18} className="text-[#A0A0B2] dark:text-gray-400 shrink-0" />
          <span className="bg-[#e6e8ec] dark:bg-[#2C2C38] h-3 w-32 rounded-md inline-block"></span>
        </div>
        <div className="w-px h-4 bg-[#E6E8EC] dark:bg-[#2C2C38] mx-2 shrink-0" />
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] shrink-0 mt-1 sm:mt-0">
          <Clock size={18} className="text-[#A0A0B2] dark:text-gray-400" />
          <span className="bg-[#e6e8ec] dark:bg-[#2C2C38] h-3 w-14 rounded-md inline-block"></span>
        </div>
      </div>
    </div>
  );
}

export default function LastSessionCard() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);

      setError(null);
      setProfileData(null);

      const userId = Cookies.get("idUser");
      if (!userId) {
        setError("No se encontró el ID de usuario");
        setLoading(false);
        return;
      }

      let response, data;
      try {
        response = await fetch(`/api/profile?userId=${userId}`);
        if (!response.ok) {
          setError("Error al obtener los datos del perfil");
          setLoading(false);
          return;
        }

        data = await response.json();

        if (data.statusCode === "200") {
          setProfileData(data.data);
        } else {
          setError("No se encontraron datos del perfil");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return <Skeleton />;
  if (error) {
    return (
      <div className="w-full sm:w-auto p-[10px] rounded-[10px] border border-[#E6E8EC] dark:border-[#2C2C38] font-poppins flex flex-col justify-between overflow-hidden min-w-0 lg:mt-2">
        <span className="text-[10px] text-[#696974] dark:text-gray-400 font-normal leading-[15px]">
          Última sesión
        </span>
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-x-2 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-2 text-[#D14343] text-[12px] font-medium leading-[18px] min-w-0">
            <Calendar size={18} className="text-[#A0A0B2] dark:text-gray-400 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-auto p-[10px] rounded-[10px] border border-[#E6E8EC] dark:border-[#2C2C38] font-poppins flex flex-col justify-between overflow-hidden min-w-0 lg:mt-2">
      <span className="text-[10px] text-[#696974] dark:text-gray-400 font-normal leading-[15px]">
        Última sesión
      </span>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-x-2 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] min-w-0">
          <Calendar size={18} className="text-[#A0A0B2] dark:text-gray-400 shrink-0" />
          <span className="truncate">
            {profileData?.lastLoginDate ? formatFullDate(profileData.lastLoginDate) : "--"}
          </span>
        </div>
        <div className="w-px h-4 bg-[#E6E8EC] dark:bg-[#2C2C38] mx-2 shrink-0" />
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] shrink-0 mt-1 sm:mt-0">
          <Clock size={18} className="text-[#A0A0B2] dark:text-gray-400" />
          <span>
            {profileData?.lastLoginDate ? formatHour(profileData.lastLoginDate) : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
