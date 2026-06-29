"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { useAutoRefresh } from "@/lib/useAutoRefresh";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiCheckCircle, FiEye, FiMessageSquare, FiRefreshCw, FiUnlock, FiX } from "react-icons/fi";
import { FaHandsPraying } from "react-icons/fa6";

export default function SupervisorSelfMissionsPage() {
  const router = useRouter();
  const [myPrayers, setMyPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      const mine = await fetchApi("/api/supervisor/self-missions");
      setMyPrayers(Array.isArray(mine) ? mine : []);
    } catch (error) {
      console.error("Erreur chargement prières superviseur :", error.message);
      if (!silent) {
        toast.error("Erreur lors du chargement des prières.");
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

  const handleReleasePrayer = async (id) => {
    const result = await Swal.fire({
      title: "Libérer cette prière ?",
      text: "Elle redeviendra disponible pour l’équipe.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, libérer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setBusyId(id);
      await fetchApi(`/api/supervisor/release-prayer/${id}`, { method: "PUT" });
      toast.success("Prière libérée.");
      await fetchData();
    } catch (error) {
      toast.error(error.message || "Impossible de libérer cette prière.");
    } finally {
      setBusyId(null);
    }
  };

  const handleContactPrayer = (prayer) => {
    localStorage.setItem("selectedSupervisorPrayer", JSON.stringify(prayer));
    router.push("/supervisor/calls");
  };

  const handleFinishPrayer = async (id) => {
    const result = await Swal.fire({
      title: "Marquer comme terminée ?",
      text: "Cette prière sortira de ton suivi actif.",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, terminer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setBusyId(id);
      await fetchApi("/api/supervisor/mark-prayer-done", {
        method: "PUT",
        body: { prayerRequestId: id },
      });
      toast.success("Prière marquée comme terminée.");
      await fetchData();
    } catch (error) {
      toast.error(error.message || "Impossible de terminer cette prière.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="text-center py-16 text-gray-500 animate-pulse">Chargement des prières...</p>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Suivi personnel"
        title="Mes prières suivies"
        description="Retrouve ici les prières que tu as prises toi-même depuis l’onglet Prières disponibles."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatPill label="Dans mon suivi" value={myPrayers.length} color="#DCFCE7" />
        <StatPill label="Urgentes" value={myPrayers.filter((prayer) => prayer.isUrgent).length} color="#FEE2E2" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <MissionPanel title="Mes prières actives" icon={<FaHandsPraying />} subtitle="Prières que tu as prises toi-même.">
          {myPrayers.length === 0 ? (
            <EmptyState text="Tu n’as pas encore pris de prière en suivi personnel." />
          ) : (
            myPrayers.map((prayer) => (
              <PrayerCard
                key={prayer._id}
                prayer={prayer}
                onView={() => setSelectedPrayer(prayer)}
                onContact={() => handleContactPrayer(prayer)}
                primaryLabel="Terminer"
                primaryIcon={<FiCheckCircle />}
                onPrimary={() => handleFinishPrayer(prayer._id)}
                secondaryLabel="Libérer"
                secondaryIcon={<FiUnlock />}
                onSecondary={() => handleReleasePrayer(prayer._id)}
                disabled={busyId === prayer._id}
              />
            ))
          )}
        </MissionPanel>
      </div>

      {selectedPrayer && (
        <PrayerModal prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} />
      )}
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-white/70 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{title}</h2>
      <p className="text-sm text-gray-600 max-w-3xl leading-6">{description}</p>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="rounded-[2rem] p-6 border border-white/70 shadow-sm" style={{ backgroundColor: color }}>
      <p className="text-sm font-bold text-gray-500">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function MissionPanel({ title, subtitle, icon, children }) {
  return (
    <section className="bg-white rounded-[2rem] border border-white/70 shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="size-11 rounded-2xl bg-[#F1EEFF] text-[#5c40e7] flex items-center justify-center">
          {icon}
        </span>
        <div>
          <h3 className="font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{children}</div>
    </section>
  );
}

function PrayerCard({ prayer, primaryLabel, primaryIcon, onPrimary, secondaryLabel, secondaryIcon, onSecondary, onView, onContact, disabled }) {
  return (
    <article className="rounded-[1.5rem] bg-[#F7F7FB] border border-gray-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="font-extrabold text-gray-900">{prayer.name || "Demande anonyme"}</h4>
          <p className="text-xs text-gray-500">
            {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
          </p>
        </div>
        {prayer.isUrgent && (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[11px] font-extrabold">
            Urgent
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 leading-6 line-clamp-4">{prayer.prayerRequest}</p>

      <button
        type="button"
        onClick={onView}
        className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-[#5c40e7] hover:underline"
      >
        <FiEye /> Voir plus
      </button>

      <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-bold text-gray-500">
        {prayer.category && <span className="px-3 py-1 rounded-full bg-white">{prayer.category}</span>}
        {prayer.subcategory && <span className="px-3 py-1 rounded-full bg-white">{prayer.subcategory}</span>}
      </div>

      <div className="flex flex-col gap-3 mt-5">
        <button
          type="button"
          disabled={disabled}
          onClick={onContact}
          className="inline-flex items-center justify-center gap-2 bg-white text-[#5c40e7] px-4 py-3 rounded-2xl text-sm font-extrabold hover:bg-[#F1EEFF] transition disabled:opacity-60"
        >
          <FiMessageSquare /> Contacter
        </button>
        {secondaryLabel && (
          <button
            type="button"
            disabled={disabled}
            onClick={onSecondary}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-2xl text-sm font-extrabold hover:bg-gray-100 transition disabled:opacity-60"
          >
            {secondaryIcon} {secondaryLabel}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onPrimary}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5c40e7] text-white px-4 py-3 rounded-2xl text-sm font-extrabold hover:scale-[1.01] transition disabled:opacity-60"
        >
          {primaryIcon} {primaryLabel}
        </button>
      </div>
    </article>
  );
}

function PrayerModal({ prayer, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">{prayer.name || "Demande anonyme"}</h3>
            <p className="text-sm text-gray-500">
              {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5 text-[11px] font-bold">
          {prayer.isUrgent && <span className="px-3 py-1 rounded-full bg-red-100 text-red-600">Urgent</span>}
          {prayer.category && <span className="px-3 py-1 rounded-full bg-[#F1EEFF] text-[#5c40e7]">{prayer.category}</span>}
          {prayer.subcategory && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500">{prayer.subcategory}</span>}
        </div>

        <div className="rounded-[1.5rem] bg-[#F7F7FB] p-5 text-sm text-gray-700 leading-7 whitespace-pre-wrap">
          {prayer.prayerRequest || "Demande non renseignée."}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[1.5rem] bg-[#F7F7FB] border border-gray-100 p-8 text-center">
      <FiRefreshCw className="mx-auto text-2xl text-[#5c40e7] mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
