"use client";
import React, { useState, useEffect } from "react";

const VolunteerMissions = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch("/api/volunteer/missions");
        const data = await response.json();
        setMissions(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des missions :", error);
      }
    };

    fetchMissions();
  }, []);

  return (
    <div>
      <h2>📌 Mes Missions</h2>
      {missions.length > 0 ? (
        missions.map((mission) => (
          <div key={mission._id} className="border p-3 my-2">
            <h3 className="font-bold">{mission.name}</h3>
            <p>{mission.request}</p>
          </div>
        ))
      ) : (
        <p>Aucune mission pour le moment.</p>
      )}
    </div>
  );
};

export default VolunteerMissions;
