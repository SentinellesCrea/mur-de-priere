"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";

const VolunteersTab = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        const data = await fetchApi("/api/supervisor/connected-volunteers");
        setVolunteers(data || []);
      } catch (err) {
        console.error("Erreur chargement bénévoles :", err.message);
      }
    }

    loadVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bénévoles connectés</h2>
      {volunteers.length === 0 ? (
        <p className="text-gray-500">Aucun bénévole actuellement connecté.</p>
      ) : (
        <ul className="space-y-2">
          {volunteers.map((v) => (
            <li key={v._id} className="p-3 border rounded bg-gray-50">
              {v.firstName} {v.lastName} – {v.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VolunteersTab;
