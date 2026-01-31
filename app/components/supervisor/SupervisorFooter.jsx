"use client";

import {
  HiSparkles,
  HiQuestionMarkCircle,
  HiCog6Tooth,
  HiGlobeAlt,
} from "react-icons/hi2";

export default function SupervisorFooter() {
  return (
    <footer className="max-w-[1200px] mx-auto px-6 lg:px-20 py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <div className="size-6 bg-gray-400 dark:bg-gray-700 rounded flex items-center justify-center text-white">
            <HiSparkles className="text-sm" />
          </div>

          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            © 2024 Mur de Prière Admin. Tous droits réservés.
          </span>
        </div>

        {/* RIGHT ICONS */}
        <div className="flex gap-6">
          <button
            aria-label="Aide"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <HiQuestionMarkCircle className="text-xl" />
          </button>

          <button
            aria-label="Paramètres"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <HiCog6Tooth className="text-xl" />
          </button>

          <button
            aria-label="Langue"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <HiGlobeAlt className="text-xl" />
          </button>
        </div>
      </div>
    </footer>
  );
}
