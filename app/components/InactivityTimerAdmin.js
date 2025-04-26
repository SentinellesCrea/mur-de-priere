'use client'; // Indiquer que ce composant est côté client

import { useEffect } from "react";

const InactivityTimer = () => {
  // Gestion du timer d'inactivité
  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer); // Efface l'ancien timer

      // Réinitialiser le timer d'inactivité à chaque action utilisateur
      inactivityTimer = setTimeout(() => {
        toast.info("Votre session a expiré en raison d'une inactivité.");
        window.location.href = "/admin/login";  // Rediriger vers la page de login
      }, 10 * 60 * 1000); // 10 minutes d'inactivité
    };

    // Ajouter des écouteurs d'événements pour surveiller les actions utilisateur
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);

    // Démarrer le timer d'inactivité au chargement de la page
    resetInactivityTimer();

    // Nettoyer le timer d'inactivité lors du démontage du composant
    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener("mousemove", resetInactivityTimer);
      document.removeEventListener("keydown", resetInactivityTimer);
      document.removeEventListener("click", resetInactivityTimer);
    };
  }, []); // La dépendance vide [] fait en sorte que ce useEffect ne soit exécuté qu'une seule fois


  return null; // Ce composant n'a pas de rendu visuel
};

export default InactivityTimer;
