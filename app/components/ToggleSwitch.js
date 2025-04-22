// app/components/ToggleSwitch.js

import { FiToggleLeft, FiToggleRight } from "react-icons/fi"; // Icônes

const ToggleSwitch = ({ isAvailable, onToggle }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <div className="flex items-center">
        <span className="mr-2 text-sm">{isAvailable ? 'Disponible' : 'Indisponible'}</span>
        <div 
          onClick={onToggle} 
          className={`relative inline-flex items-center cursor-pointer w-14 h-8 rounded-full transition-all duration-300 ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
        >
          <div className={`absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 ${isAvailable ? 'bg-white transform translate-x-6' : 'bg-white'}`}>
          </div>
          
        </div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
