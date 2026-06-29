"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiInbox, FiMail, FiPhone, FiSend, FiUsers } from "react-icons/fi";
import { FaHandsPraying } from "react-icons/fa6";

export default function SupervisorAvailablePrayersPage() {
  const router = useRouter();
  const [prayers, setPrayers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      const [available, validatedVolunteers] = await Promise.all([
        fetchApi("/api/supervisor/prayerRequests"),
        fetchApi("/api/supervisor/volunteers/validate"),
      ]);

      const sorted = Array.isArray(available)
        ? [...available].sort((a, b) => {
            if (a.isUrgent === b.isUrgent) {
              return new Date(b.datePublication) - new Date(a.datePublication);
            }
            return Number(b.isUrgent) - Number(a.isUrgent);
          })
        : [];

      setPrayers(sorted);
      setVolunteers(Array.isArray(validatedVolunteers) ? validatedVolunteers : []);
    } catch (error) {
      console.error("Erreur chargement prières disponibles :", error.message);
      if (!silent) {
        toast.error("Erreur lors du chargement des prières disponibles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const user = await fetchApi("/api/supervisor/me");
        if (!user || user.role !== "supervisor") {
          router.push("/volunteers/login");
          return;
        }
        await fetchData();
      } catch (error) {
        console.error("Erreur sécurité superviseur :", error.message);
        router.push("/volunteers/login");
      }
    }

    init();
  }, [router]);

  useAutoRefresh(() => fetchData({ silent: true }), {
    enabled: !loading,
    intervalMs: 7000,
  });

  const urgentCount = useMemo(
    () => prayers.filter((prayer) => prayer.isUrgent).length,
    [prayers]
  );

  const handleTakePrayer = async (id) => {
    const result = await Swal.fire({
      title: "Je m’en occupe ?",
      text: "Cette prière sera ajoutée à tes prières suivies.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5c40e7",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, je m’en occupe",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setBusyId(id);
      await fetchApi(`/api/supervisor/reserve/${id}`, { method: "PUT" });
      toast.success("Prière ajoutée à ton suivi.");
      await fetchData();
    } catch (error) {
      toast.error(error.message || "Impossible de prendre cette prière.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDispatchPrayer = async (prayerId) => {
    const volunteerId = assignments[prayerId];
    if (!volunteerId) {
      toast.error("Choisis d’abord un bénévole.");
      return;
    }

    try {
      setBusyId(prayerId);
      await fetchApi(`/api/supervisor/dispatch-prayer/${prayerId}`, {
        method: "PUT",
        body: { volunteerId },
      });
      toast.success("Prière dispatchée au bénévole.");
      setAssignments((prev) => ({ ...prev, [prayerId]: "" }));
      await fetchData();
    } catch (error) {
      toast.error(error.message || "Impossible de dispatcher cette prière.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des prières disponibles...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-white/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-2xl bg-[#FBE8FD] text-[#5c40e7] flex items-center justify-center text-xl">
            <FiInbox />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-2">Prières disponibles</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Prières qui demandent un bénévole</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-3xl">
              Toutes les demandes libres. Tu peux les prendre toi-même ou les dispatcher vers un bénévole validé.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Disponibles" value={prayers.length} color="#FBE8FD" />
          <StatBox label="Urgentes" value={urgentCount} color="#FEE2E2" />
        </div>
      </div>

      {prayers.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-10 text-center text-gray-500 border border-white/70 shadow-sm">
          Aucune prière disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {prayers.map((prayer) => (
            <article key={prayer._id} className="bg-white rounded-[2rem] border border-white/70 shadow-sm p-6">
              <div className="flex flex-wrap justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{prayer.name || "Demande anonyme"}</h3>
                  <p className="text-xs text-gray-500">
                    {prayer.datePublication
                      ? new Date(prayer.datePublication).toLocaleDateString("fr-FR")
                      : "Date inconnue"}
                  </p>
                </div>
                {prayer.isUrgent && (
                  <span className="h-fit px-3 py-1 rounded-full bg-red-100 text-red-600 text-[11px] font-extrabold">
                    Urgent
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 mb-4">
                <span className="flex items-center gap-2 text-sm"><FiMail className="text-[#5c40e7]" /> {prayer.email || "Email non fourni"}</span>
                <span className="flex items-center gap-2 text-sm"><FiPhone className="text-[#5c40e7]" /> {prayer.phone || "Téléphone non fourni"}</span>
              </div>

              <p className="text-sm text-gray-700 leading-6 bg-[#F7F7FB] rounded-2xl p-4 line-clamp-4">
                {prayer.prayerRequest || "Demande non renseignée."}
              </p>

              <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-bold">
                {prayer.category && <span className="px-3 py-1 rounded-full bg-[#F1EEFF] text-[#5c40e7]">{prayer.category}</span>}
                {prayer.subcategory && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500">{prayer.subcategory}</span>}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <button
                  type="button"
                  disabled={busyId === prayer._id}
                  onClick={() => handleTakePrayer(prayer._id)}
                  className="inline-flex items-center justify-center gap-2 bg-[#5c40e7] text-white px-4 py-3 rounded-2xl text-sm font-extrabold hover:scale-[1.01] transition disabled:opacity-60"
                >
                  <FaHandsPraying /> Je m’en occupe
                </button>

                <div className="flex gap-2">
                  <select
                    value={assignments[prayer._id] || ""}
                    onChange={(event) =>
                      setAssignments((prev) => ({ ...prev, [prayer._id]: event.target.value }))
                    }
                    className="min-w-0 flex-1 border border-gray-200 rounded-2xl px-4 py-3 bg-white text-sm"
                  >
                    <option value="">Bénévole</option>
                    {volunteers.map((volunteer) => (
                      <option key={volunteer._id} value={volunteer._id}>
                        {volunteer.firstName} {volunteer.lastName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busyId === prayer._id || !assignments[prayer._id]}
                    onClick={() => handleDispatchPrayer(prayer._id)}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-2xl text-sm font-extrabold hover:bg-green-700 transition disabled:opacity-60"
                  >
                    <FiSend /> Dispatcher
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-[1.5rem] px-5 py-4 text-center min-w-[120px]" style={{ backgroundColor: color }}>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
    </div>
  );
}
