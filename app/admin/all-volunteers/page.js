"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi"; // Ton helper pour les appels API sécurisés
import Image from "next/image";

const VolunteersPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les bénévoles
  const fetchVolunteers = async () => {
    try {
      const data = await fetchApi("/api/volunteers/all");

      if (!Array.isArray(data)) {
        console.error("Résultat inattendu :", data);
        return;
      }

      setVolunteers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des bénévoles :", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">👥 Tous les bénévoles</h1>

      {loading ? (
        <p>Chargement des bénévoles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteers.map((volunteer) => (
            <div key={volunteer._id} className="bg-white shadow rounded-lg p-6 flex flex-col">
              {/* Photo de profil */}
              {volunteer.profileImage && (
                <div className="flex justify-center mb-4">
                  <Image
                    src={volunteer.profileImage}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-700 mb-2">{volunteer.firstName} {volunteer.lastName}</h2>
              <p className="text-gray-600"><strong>Email :</strong> {volunteer.email}</p>
              <p className="text-gray-600"><strong>Téléphone :</strong> {volunteer.phone}</p>
              <p className="text-gray-600"><strong>Disponibilité :</strong> {volunteer.isAvailable ? "Disponible" : "Indisponible"}</p>
              <p className="text-gray-600"><strong>Validé :</strong> {volunteer.isValidated ? "Oui" : "Non"}</p>
              <p className="text-gray-600"><strong>Statut :</strong> {volunteer.status}</p>
              <p className="text-gray-500 text-sm mt-2">Créé le : {new Date(volunteer.date).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteersPage;
