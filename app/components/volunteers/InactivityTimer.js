'use client';

import { useEffect, useState, useRef } from "react";

const InactivityTimer = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const responseTimer = useRef(null);
  const inactivityTimer = useRef(null);

  // Effet pour gérer l'inactivité
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (showPrompt) return; // Ne rien faire si le prompt est affiché

      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setShowPrompt(true);
      }, 10 * 60 * 1000); // 5 minutes
    };

    // Écouteurs d'activité utilisateur
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);

    resetInactivityTimer(); // au chargement

    return () => {
      clearTimeout(inactivityTimer.current);
      clearTimeout(responseTimer.current);
      document.removeEventListener("mousemove", resetInactivityTimer);
      document.removeEventListener("keydown", resetInactivityTimer);
      document.removeEventListener("click", resetInactivityTimer);
    };
  }, [showPrompt]);

  // Effet pour gérer le compte à rebours de réponse (1 min)
  useEffect(() => {
    if (showPrompt) {
      responseTimer.current = setTimeout(() => {
        window.location.href = "/volunteers/login";
      }, 60 * 1000); // 1 minute

      return () => clearTimeout(responseTimer.current);
    }
  }, [showPrompt]);

  const handleStayConnected = () => {
    clearTimeout(responseTimer.current);
    setShowPrompt(false);
  };

  const handleLogout = async () => {
    clearTimeout(responseTimer.current);
    try {
      await fetch("/api/volunteers/logout", { method: "POST" }); // 🔐 Supprime le cookie
    } catch (error) {
      console.error("Erreur logout :", error);
    } finally {
      window.location.href = "/volunteers/login";
    }
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
