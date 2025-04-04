'use client';

const WelcomeSection = () => {
  const userName = 'Luis';

  return (
    <section className="pb-4 font-poppins">
      <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444F]">
        Hola, <span className="text-[#0080FF] font-semibold leading-[18px]">{userName}</span>
      </h1>
      <p className="text-[26px] leading-[39px] font-semibold text-[#44444F] mt-1">
        Bienvenido de nuevo
      </p>
    </section>
  );
};

export default WelcomeSection;