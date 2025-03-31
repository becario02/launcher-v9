'use client';

const WelcomeSection = () => {
  // Aquí podrías obtener dinámicamente el nombre del usuario si lo deseas
  const userName = 'Luis';

  return (
    <section className="pb-4">
      <h1 className="text-2xl font-light text-gray-700">
        Hola, <span className="font-medium text-black">{userName}</span>
      </h1>
      <p className="text-gray-500 text-sm mt-1">Bienvenido de nuevo</p>
    </section>
  );
};

export default WelcomeSection;
