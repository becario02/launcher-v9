'use client';

import Cookies from 'js-cookie';

const WelcomeSection = () => {
  // Leer fullname desde la cookie y obtener solo el primer nombre
  const getFirstName = () => {
    const fullName = Cookies.get('fullname');
    if (!fullName) return '';
    const parts = decodeURIComponent(fullName).split(' ');
    return parts[0];
  };

  const userName = getFirstName();

  return (
    <section className="pb-4 font-poppins">
      <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444F] dark:text-gray-200">
        Hola,{' '}
        <span
          className="font-semibold leading-[18px]"
          style={{ color: 'var(--primary-color)' }}
        >
          {userName}
        </span>
      </h1>
      <p className="text-[26px] leading-[39px] font-semibold text-[#44444F] dark:text-gray-200 mt-1">
        Bienvenido de nuevo
      </p>
    </section>
  );
};

export default WelcomeSection;
