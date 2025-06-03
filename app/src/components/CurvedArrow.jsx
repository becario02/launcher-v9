// components/ArrowLCurvePerfect.jsx
export default function ArrowLCurvePerfect({ className = "" }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* L curva */}
      <path
        d="M20 10 V70 Q20 90 40 90 H80"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Flecha: punta a la derecha, más grande */}
      <polygon
        points="92,90 72,75 72,105"
        fill="currentColor"
      />
    </svg>
  );
}
