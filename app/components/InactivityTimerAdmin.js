'use client';

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify"; // si tu utilises react-toastify

const InactivityTimer = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const inactivityTimer = useRef(null);
  const responseTimer = useRef(null);

  // Effet principal : reset du timer uniquement si prompt non affiché
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (showPrompt) return; // ❌ Ne rien faire si fenêtre déjà affichée

      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setShowPrompt(true); // 🟡 Affiche le message de confirmation
      }, 10 * 60 * 1000); // 10 minutes d'inactivité
    };

    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);

    resetInactivityTimer(); // Initialisation

    return () => {
      clearTimeout(inactivityTimer.current);
      clearTimeout(responseTimer.current);
      document.removeEventListener("mousemove", resetInactivityTimer);
      document.removeEventListener("keydown", resetInactivityTimer);
      document.removeEventListener("click", resetInactivityTimer);
    };
  }, [showPrompt]);

  // Gestion du compte à rebours de réponse (1 minute max)
  useEffect(() => {
    if (showPrompt) {
      responseTimer.current = setTimeout(() => {
        toast.info("Votre session a expiré en raison d'une inactivité.");
        window.location.href = "/admin/login";
      }, 60 * 1000); // 1 minute

      return () => clearTimeout(responseTimer.current);
    }
  }, [showPrompt]);

  const handleStayConnected = () => {
    clearTimeout(responseTimer.current);
    setShowPrompt(false); // ❎ Masquer la fenêtre → timer redémarre automatiquement
  };

  const handleLogout = () => {
    clearTimeout(responseTimer.current);
    window.location.href = "/admin/login";
  };

  return showPrompt ? (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg border rounded p-4 z-50 max-w-xs">
      <p className="text-gray-800 font-medium mb-2">
        Vous êtes inactif depuis un moment. Souhaitez-vous rester connecté ?
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleStayConnected}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          Oui
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Non
        </button>
      </div>
    </div>
  ) : null;
};

export default InactivityTimer;
