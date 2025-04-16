// src/components/DivisionModuleCard.js

const DivisionModuleCard = ({ title, description }) => (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
  
  export default DivisionModuleCard;
  