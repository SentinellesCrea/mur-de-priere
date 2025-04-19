"use client";
import React, { useState, useEffect } from "react";
import Button from "./ui/button";
import usePrayerRequestStore from "../store/prayerRequestStore";

const handleTakeMission = (id) => {
  usePrayerRequestStore.getState().takeMission(id);
};


const PrayerRequestsDisplay = () => {
  const [prayers, setPrayers] = useState([]);
  const { data: session } = useSession();
  const prayerRequests = usePrayerRequestStore((state) => state.prayerRequestsGen);
  const handleTakeMission = usePrayerRequestStore((state) => state.handleTakeMission);

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const response = await fetch("/api/prayerRequests");
        const data = await response.json();
        setPrayers(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des prières :", error);
      }
    };

    fetchPrayers();
  }, []);


  return (
    <div>
      <h2>Liste des prières</h2>
      {prayers.length > 0 ? (
        prayers.map((prayer) => (
          <div key={prayer._id} className="p-4 border rounded-md shadow-md mb-4">
            <h3 className="text-lg font-semibold">{prayer.name}</h3>
            <p className="text-gray-700">{prayer.request}</p>
            <Button onClick={() => handleTakeMission(prayer._id)} className="mt-2">
              Je m'en occupe
            </Button>
          </div>
        ))
      ) : (
        <p>Aucune prière pour le moment.</p>
      )}
    </div>
  );
};

export default PrayerRequestsDisplay;
