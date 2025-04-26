'use client'; // Indiquer que ce composant est côté client

import { useEffect } from "react";

const InactivityTimer = () => {
  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert("Votre session a expiré en raison d'une inactivité.");
        window.location.href = "/volunteers/login"; // Rediriger vers la page de login
      }, 10 * 60 * 1000); // 20 minutes d'inactivité
    };

    // Ajouter des écouteurs d'événements pour surveiller les actions utilisateur
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);

    // Démarrer le timer d'inactivité au chargement de la page
    resetInactivityTimer();

    // Nettoyer les écouteurs et le timer lors du démontage du composant
    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener("mousemove", resetInactivityTimer);
      document.removeEventListener("keydown", resetInactivityTimer);
      document.removeEventListener("click", resetInactivityTimer);
    };
  }, []);

  return null; // Ce composant n'a pas de rendu visuel
};

export default InactivityTimer;
