"use client";
import { useEffect, useState } from "react";
import Button from "../../components/ui/button";

export default function AdminManageVolunteersPage() {
  const [validatedVolunteers, setValidatedVolunteers] = useState([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;

  const fetchValidatedVolunteers = async () => {
    try {
      const res = await fetch("/api/admin/volunteers", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setValidatedVolunteers(Array.isArray(data) ? data.filter(v => v.isValidated) : []);
    } catch (err) {
      console.error("Erreur bénévoles validés:", err);
    }
  };

  useEffect(() => {
    fetchValidatedVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">✅ Gérer les bénévoles</h2>
      {validatedVolunteers.length === 0 ? (
        <p>Aucun bénévole à gérer.</p>
      ) : (
        <ul className="space-y-2">
          {validatedVolunteers.map((v) => (
            <li key={v._id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{v.firstName} ({v.email})</p>
                <p className="text-sm text-gray-500">Téléphone : {v.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-yellow-600 text-white">Désactiver</Button>
                <Button className="bg-red-600 text-white">Supprimer</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
