const IconModulos = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className} // aquí aplicas clases como text-primary
  >
    <path
      d="M4 4h16v3H4V4zM4 10h16v3H4v-3zM4 16h16v3H4v-3z"
      stroke="currentColor" // ← clave para que siga el color del texto
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconModulos;
