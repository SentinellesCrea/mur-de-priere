"use client";

import { FiToggleLeft, FiToggleRight } from "react-icons/fi"; // Icônes

const ToggleSwitch = ({ isAvailable, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{isAvailable ? 'Disponible' : 'Indisponible'}</span>
      <button
        onClick={onToggle}
        className={`relative flex items-center w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
          isAvailable ? 'bg-green-500' : 'bg-gray-400'
        }`}
      >
        <span
          className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
            isAvailable ? 'translate-x-6' : ''
          }`}
        ></span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
