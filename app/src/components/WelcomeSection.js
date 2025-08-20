'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const WelcomeSection = () => {
  const getFirstName = () => {
    const fullName = Cookies.get('fullname');
    if (!fullName) return '';
    return decodeURIComponent(fullName).split(' ')[0];
  };

  const userName = getFirstName();
  const [saludo, setSaludo] = useState('Bienvenido de nuevo');

  useEffect(() => {
    if (!userName) return;
    const key = `gender:${userName.toLowerCase()}`;
    const cached = localStorage.getItem(key);

    if (cached) {
      setSaludo(cached === 'female' ? 'Bienvenida de nuevo' : 'Bienvenido de nuevo');
    } else {
      fetch(`https://api.genderize.io?name=${encodeURIComponent(userName)}&country_id=MX`)
        .then(r => r.json())
        .then(d => {
          const g = d.gender || 'male'; // default masculino
          localStorage.setItem(key, g);
          setSaludo(g === 'female' ? 'Bienvenida de nuevo' : 'Bienvenido de nuevo');
        })
        .catch(() => setSaludo('Bienvenido de nuevo')); // fallback masculino
    }
  }, [userName]);

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
        {saludo}
      </p>
    </section>
  );
};

export default WelcomeSection;
