"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AdminPrayersPage() {
  const router = useRouter();
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const prayersPerPage = 12; // 🔥 Combien de prières par page

  const fetchPrayerRequests = async () => {
    try {
      const data = await fetchApi("/api/prayerRequests");
      setPrayerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement prières :", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrayer = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchApi(`/api/admin/prayer-request/${id}`, {
          method: "DELETE",
        });

        if (!res.ok && res.error) throw new Error(res.error);

        setPrayerRequests((prev) => prev.filter((req) => req._id !== id));
        Swal.fire('Supprimé!', 'La demande de prière a été supprimée.', 'success');
      } catch (err) {
        console.error("Erreur suppression :", err.message);
        Swal.fire('Erreur!', 'Erreur lors de la suppression.', 'error');
      }
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const admin = await fetchApi("/api/admin/me");

        if (!admin || !admin.name) {
          router.push("/admin/login");
        } else {
          await fetchPrayerRequests();
        }
      } catch (error) {
        console.error("Erreur de vérification admin :", error.message);
        router.push("/admin/login");
      }
    }

    init();
  }, [router]);

  const unmoderated = prayerRequests.filter((p) => !p.isModerated);

  // Pagination logic
  const indexOfLastPrayer = currentPage * prayersPerPage;
  const indexOfFirstPrayer = indexOfLastPrayer - prayersPerPage;
  const currentPrayers = unmoderated.slice(indexOfFirstPrayer, indexOfLastPrayer);
  const totalPages = Math.ceil(unmoderated.length / prayersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Chargement...</p>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Demandes de Prière à modérer</h2>

      {unmoderated.length === 0 ? (
        <p>Aucune demande à modérer.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {currentPrayers.map((prayer) => (
              <div key={prayer._id} className="border p-4 rounded shadow">
                <p><strong>Prénom :</strong> {prayer.name}</p>
                <p><strong>Texte :</strong> {prayer.prayerRequest}</p>
                <p><strong>Date :</strong> {new Date(prayer.datePublication).toLocaleDateString('fr-FR')}</p>

                <div className="mt-4">
                  <button
                    onClick={() => handleDeletePrayer(prayer._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className=" hover:bg-gray-300 text-black px-3 py-1 rounded "
            >
              <FiArrowLeftCircle />
            </button>
            <span className="text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className=" hover:bg-gray-300 text-black px-3 py-1 rounded "
            >
              <FiArrowRightCircle />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
