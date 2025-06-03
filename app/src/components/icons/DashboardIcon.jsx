export const DashboardIcon = ({ className, color = "currentColor" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M14 14h6v6h-6v-6zM14 4h6v6h-6V4zM4 4h6v6H4V4zM4 14h6v6H4v-6z" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);