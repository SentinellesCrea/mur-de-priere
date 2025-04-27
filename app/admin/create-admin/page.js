"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import AdminNavbar from "../../components/AdminNavbar";
import { toast } from "react-toastify";

export default function CreateAdminPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetchApi("/api/admin/volunteers/transformToAdmin", {
          method: "GET",
        });
        setVolunteers(res || []);
      } catch (error) {
        console.error("Erreur chargement bénévoles:", error.message);
      }
    };

    fetchVolunteers();
  }, []);


  const handlePromote = async () => {
    if (!selectedVolunteer) return;

    // Concaténer prénom + nom pour envoyer le bon name
    const fullName = `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`;

    try {
      const res = await fetchApi(`/api/admin/volunteers/transformToAdmin/${selectedVolunteer._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email: selectedVolunteer.email,
          password: "$2a$12$JnvYSifszCgyB1GziMYv3eBKWg3dLvwED0f8ymjZWfgIXamJORcLO", // MotdepasseTemporaire123!
        }),
      });

      if (res && res.message) {
        toast.success(`${fullName} est maintenant administrateur ✅`);

        // Mise à jour locale
        setVolunteers((prev) => prev.filter((v) => v._id !== selectedVolunteer._id));
        setSelectedVolunteer(null);
        setFeedback(""); // plus besoin
      }
    } catch (error) {
      console.error("Erreur promotion:", error.message);
      toast.error(error.message || "Erreur serveur.");
    }
  };


  return (
    <div>
      <AdminNavbar />
      <div className="flex mt-20 px-10">
        {/* Liste des bénévoles */}
        <div className="w-1/3 border-r p-4">
          <h2 className="text-xl font-semibold mb-4">Bénévoles disponibles</h2>
          {volunteers.length === 0 ? (
            <p>Aucun bénévole disponible.</p>
          ) : (
            <ul className="space-y-2">
              {volunteers.map((volunteer) => (
                <li
                  key={volunteer._id}
                  onClick={() => setSelectedVolunteer(volunteer)}
                  className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                    selectedVolunteer?._id === volunteer._id ? "bg-gray-300" : ""
                  }`}
                >
                  {volunteer.firstName} {volunteer.lastName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Détails du bénévole sélectionné */}
        <div className="w-2/3 p-6">
          {selectedVolunteer ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Détails du bénévole</h2>
              <p><strong>Prénom :</strong> {selectedVolunteer.firstName}</p>
              <p><strong>Nom :</strong> {selectedVolunteer.lastName}</p>
              <p><strong>Email :</strong> {selectedVolunteer.email}</p>
              <p><strong>Téléphone :</strong> {selectedVolunteer.phone}</p>

              <button
                onClick={handlePromote}
                className="mt-6 bg-green-600 text-white p-3 rounded hover:bg-green-700"
              >
                Promouvoir en Admin
              </button>

              {feedback && (
                <p className="mt-4 text-green-700 font-medium">{feedback}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Sélectionnez un bénévole pour voir ses informations.</p>
          )}
        </div>
      </div>
    </div>
  );
}
