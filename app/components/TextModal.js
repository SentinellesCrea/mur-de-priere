"use client";

import { useEffect } from "react";
import { FiBookOpen, FiX } from "react-icons/fi";

export default function TextModal({ text, onClose }) {
  useEffect(() => {
    if (!text) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, text]);

  if (!text) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172033]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="text-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-[#f7f5f2] text-lg text-gray-700 transition hover:bg-[#f0e7df] hover:text-[#8b1e3f]"
          aria-label="Fermer l’enseignement"
        >
          <FiX aria-hidden="true" />
        </button>

        <FiBookOpen className="text-2xl text-[#8b1e3f]" aria-hidden="true" />
        <h2
          id="text-modal-title"
          className="mt-3 pr-10 text-xl font-bold text-[#2f2a26] sm:text-2xl"
        >
          {text.title}
        </h2>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed text-gray-700">
          {text.message}
        </p>
      </div>
    </div>
  );
}
