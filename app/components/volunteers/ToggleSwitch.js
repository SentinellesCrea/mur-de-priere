"use client";

import { useEffect, useState } from "react";
import useAvailabilityStore from "../../store/availabilityStore";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";

const ToggleSwitch = () => {
  const { isAvailable, toggleAvailability } = useAvailabilityStore();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/volunteers/updateAvailability", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de mise à jour");
      }

      toggleAvailability(); // mise à jour de l'état local
    } catch (error) {
      console.error("Erreur lors du toggle:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Effet pour passer à indisponible automatiquement à la déconnexion
   useEffect(() => {
      const handleUnload = () => {
        if (!isAvailable) return;

        try {
          navigator.sendBeacon(
          "/api/volunteers/auto-unavailable",
            new Blob([JSON.stringify({})], {
              type: "application/json",
            })
          );
        } catch (e) {
          console.error("Erreur sendBeacon :", e.message);
        }
      };

      window.addEventListener("beforeunload", handleUnload);
      return () => window.removeEventListener("beforeunload", handleUnload);
    }, [isAvailable]);


  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">
        {isAvailable ? "Disponible" : "Indisponible"}
      </span>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative flex items-center w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
          isAvailable ? "bg-green-500" : "bg-gray-400"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
            isAvailable ? "translate-x-6" : ""
          }`}
        ></span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
