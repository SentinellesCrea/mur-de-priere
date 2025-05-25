"use client";

export default function TextModal({ text, onClose }) {
  if (!text) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Message complet</h2>
        <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-[#d4967d] hover:bg-[#c1836a] text-white px-4 py-2 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
