"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import {
  FiArchive,
  FiCheck,
  FiClock,
  FiFilter,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const STATUS_META = {
  all: { label: "Toutes", tone: "bg-[#8B1E3F] text-white", icon: FiShield },
  moderation: { label: "À modérer", tone: "bg-[#FFF4E8] text-[#9A4B16]", icon: FiClock },
  toAssign: { label: "À attribuer", tone: "bg-[#EEF6FF] text-[#3569A8]", icon: FiUserCheck },
  proposed: { label: "Proposées", tone: "bg-[#F4F0FA] text-[#6D5A8D]", icon: FiUserCheck },
  inProgress: { label: "En suivi", tone: "bg-[#EAF8F5] text-[#0F766E]", icon: FiCheck },
  reserved: { label: "Réservées", tone: "bg-[#EEF6FF] text-[#3569A8]", icon: FiUserCheck },
  archived: { label: "Archivées", tone: "bg-[#F2EBE3] text-[#5f5146]", icon: FiArchive },
  rejected: { label: "Rejetées", tone: "bg-[#fff1f1] text-[#9f1239]", icon: FiX },
  published: { label: "Publiées", tone: "bg-[#EFF8ED] text-[#5F8A61]", icon: FiCheck },
};

const FILTERS = [
  "all",
  "moderation",
  "toAssign",
  "proposed",
  "inProgress",
  "reserved",
  "archived",
  "rejected",
  "published",
];

const PRAYER_PREVIEW_LIMIT = 280;

function getPersonName(person) {
  if (!person) return "";
  return [person.firstName, person.lastName].filter(Boolean).join(" ") || person.email || "Responsable";
}

function formatDate(date) {
  if (!date) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getPrayerStatus(prayer) {
  if (prayer.rejectedAt) return "rejected";
  if (!prayer.isModerated) return "moderation";
  if (prayer.isAnswered) return "archived";
  if (prayer.reserveTo) return "reserved";
  if (prayer.assignedTo && prayer.isAssigned) return "inProgress";
  if (prayer.assignedTo) return "proposed";
  if (prayer.wantsVolunteer) return "toAssign";
  return "published";
}

function getOwnerLabel(prayer) {
  if (prayer.assignedTo) return getPersonName(prayer.assignedTo);
  if (prayer.reserveTo) return getPersonName(prayer.reserveTo);
  if (prayer.finishedBy) return getPersonName(prayer.finishedBy);
  return "Aucun responsable";
}

function matchesSearch(prayer, query) {
  if (!query.trim()) return true;
  const haystack = [
    prayer.name,
    prayer.email,
    prayer.phone,
    prayer.prayerRequest,
    prayer.category,
    prayer.subcategory,
    getOwnerLabel(prayer),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

export default function AdminPrayersPage() {
  const router = useRouter();
  const [prayers, setPrayers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [expandedPrayer, setExpandedPrayer] = useState(null);

  const fetchAdminData = async () => {
    const [prayersData, volunteersData] = await Promise.all([
      fetchApi("/api/admin/prayer-requests"),
      fetchApi("/api/admin/volunteers/validate"),
    ]);

    setPrayers(Array.isArray(prayersData) ? prayersData : []);
    setVolunteers(
      Array.isArray(volunteersData)
        ? volunteersData.filter((user) => ["volunteer", "supervisor"].includes(user.role))
        : []
    );
  };

  useEffect(() => {
    async function init() {
      try {
        const admin = await fetchApi("/api/admin/me");
        if (!admin || !admin.firstName) {
          router.push("/admin/login");
          return;
        }
        await fetchAdminData();
      } catch (error) {
        console.error("Erreur chargement console prières :", error.message);
        toast.error("Impossible de charger la console des prières.");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const counts = useMemo(() => {
    return prayers.reduce(
      (acc, prayer) => {
        const status = getPrayerStatus(prayer);
        acc.all += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      FILTERS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})
    );
  }, [prayers]);

  const filteredPrayers = useMemo(() => {
    return prayers.filter((prayer) => {
      const status = getPrayerStatus(prayer);
      const statusMatches = activeFilter === "all" || activeFilter === status;
      return statusMatches && matchesSearch(prayer, search);
    });
  }, [activeFilter, prayers, search]);

  const summary = useMemo(() => {
    return [
      { label: "Total", value: counts.all, accent: "border-[#8B1E3F]" },
      { label: "À modérer", value: counts.moderation, accent: "border-[#C76A2A]" },
      { label: "À attribuer", value: counts.toAssign, accent: "border-[#3569A8]" },
      {
        label: "Actives",
        value: counts.proposed + counts.inProgress + counts.reserved,
        accent: "border-[#0F766E]",
      },
      { label: "Archivées", value: counts.archived, accent: "border-[#bca999]" },
      { label: "Rejetées", value: counts.rejected, accent: "border-[#A3193F]" },
    ];
  }, [counts]);

  const updatePrayerInState = (updatedPrayer) => {
    if (!updatedPrayer?._id) return;
    setPrayers((current) =>
      current.map((prayer) => (prayer._id === updatedPrayer._id ? updatedPrayer : prayer))
    );
  };

  const performAction = async (prayerId, action, body = {}, successMessage = "Action appliquée") => {
    try {
      setActionLoading(`${action}:${prayerId}`);
      const data = await fetchApi(`/api/admin/prayer-request/${prayerId}`, {
        method: "PUT",
        body: { action, ...body },
      });
      updatePrayerInState(data.prayer);
      toast.success(successMessage);
    } catch (error) {
      console.error("Erreur action admin prière :", error.message);
      toast.error(error.message || "L'action n'a pas pu être appliquée.");
    } finally {
      setActionLoading("");
    }
  };

  const confirmAndRun = async ({ prayerId, action, title, text, body, successMessage }) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Confirmer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      await performAction(prayerId, action, body, successMessage);
    }
  };

  const handleDeletePrayer = async (prayerId) => {
    const result = await Swal.fire({
      title: "Supprimer définitivement ?",
      text: "Cette action retire la demande et ses éléments liés.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(`delete:${prayerId}`);
      await fetchApi(`/api/admin/prayer-request/${prayerId}`, { method: "DELETE" });
      setPrayers((current) => current.filter((prayer) => prayer._id !== prayerId));
      toast.success("Demande supprimée.");
    } catch (error) {
      console.error("Erreur suppression prière :", error.message);
      toast.error(error.message || "La suppression a échoué.");
    } finally {
      setActionLoading("");
    }
  };

  const handleAssign = async (prayer) => {
    const volunteerId = assignments[prayer._id];
    if (!volunteerId) {
      toast.info("Choisis d'abord un responsable.");
      return;
    }

    await performAction(
      prayer._id,
      "assign",
      { volunteerId },
      prayer.assignedTo || prayer.reserveTo ? "Demande réassignée." : "Demande attribuée."
    );
    setAssignments((current) => ({ ...current, [prayer._id]: "" }));
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-8 text-center text-[#6B5B4D]">
        Chargement de la console des prières...
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-lg bg-[#fff7ef] p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B1E3F]">
            Console admin
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#2f2a26]">Gestion complète des prières</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B5B4D]">
            Vue globale des demandes, de leur responsable et des actions de reprise réservées à
            l&apos;admin.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d9c7b8] bg-[#fffaf5] px-4 text-sm font-semibold text-[#5f5146] shadow-sm transition hover:border-[#8B1E3F] hover:text-[#8B1E3F]"
        >
          <FiRefreshCcw />
          Actualiser
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {summary.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border border-[#eadfd3] border-l-4 ${item.accent} bg-[#fffaf5] p-4 shadow-sm`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6b5f]">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#2f2a26]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a58a75]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une prière, un contact, une catégorie..."
              className="h-11 w-full rounded-lg border border-[#d9c7b8] bg-white pl-10 pr-3 text-sm text-[#332c26] outline-none transition focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#f8d8e1]"
            />
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-[#7a6b5f]">
            <FiFilter />
            {filteredPrayers.length} demande{filteredPrayers.length > 1 ? "s" : ""} affichée
            {filteredPrayers.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((status) => {
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            const isActive = activeFilter === status;

            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#8B1E3F] bg-[#8B1E3F] text-white"
                    : "border-[#eadfd3] bg-white text-[#5f5146] hover:border-[#d9b99f] hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
                }`}
              >
                <Icon />
                {meta.label}
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${
                    isActive ? "bg-white/15 text-white" : "bg-[#fffaf5] text-[#7a6b5f]"
                  }`}
                >
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredPrayers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9c7b8] bg-[#fffaf5] p-10 text-center text-[#7a6b5f]">
          Aucune demande ne correspond à cette vue.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredPrayers.map((prayer) => {
            const status = getPrayerStatus(prayer);
            const meta = STATUS_META[status];
            const isBusy = actionLoading.endsWith(`:${prayer._id}`);
            const hasOwner = Boolean(prayer.assignedTo || prayer.reserveTo);
            const canUseActiveActions = !prayer.rejectedAt;
            const prayerText = prayer.prayerRequest || "";
            const shouldTruncatePrayer =
              prayerText.length > PRAYER_PREVIEW_LIMIT || prayerText.split(/\r?\n/).length > 4;

            return (
              <article
                key={prayer._id}
                className="rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${meta.tone}`}>
                        {meta.label}
                      </span>
                      {prayer.isUrgent && (
                        <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                          Urgente
                        </span>
                      )}
                      {prayer.wantsVolunteer && (
                        <span className="rounded-md bg-[#EEF6FF] px-2.5 py-1 text-xs font-bold text-[#3569A8]">
                          Suivi demandé
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-[#2f2a26]">
                      {prayer.name || "Demande anonyme"}
                    </h3>
                    <p
                      className={`mt-2 whitespace-pre-line text-sm leading-6 text-[#5f5146] ${
                        shouldTruncatePrayer ? "line-clamp-4" : ""
                      }`}
                    >
                      {prayerText}
                    </p>
                    {shouldTruncatePrayer && (
                      <button
                        type="button"
                        onClick={() => setExpandedPrayer(prayer)}
                        className="mt-2 text-sm font-bold text-[#8B1E3F] hover:text-[#741733]"
                      >
                        Voir plus
                      </button>
                    )}

                    <dl className="mt-4 grid gap-3 text-sm text-[#6B5B4D] sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-[#2f2a26]">Reçue le</dt>
                        <dd>{formatDate(prayer.datePublication || prayer.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#2f2a26]">Catégorie</dt>
                        <dd>{[prayer.category, prayer.subcategory].filter(Boolean).join(" / ") || "Non classée"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#2f2a26]">Contact</dt>
                        <dd className="break-words">{prayer.email || prayer.phone || "Non fourni"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#2f2a26]">Responsable</dt>
                        <dd>{getOwnerLabel(prayer)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="w-full rounded-lg bg-white/70 p-3">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#7a6b5f]">
                      Attribuer ou réassigner
                    </label>
                    <div className="mt-2 flex gap-2">
                      <select
                        value={assignments[prayer._id] || ""}
                        onChange={(event) =>
                          setAssignments((current) => ({
                            ...current,
                            [prayer._id]: event.target.value,
                          }))
                        }
                        disabled={Boolean(prayer.rejectedAt)}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm text-[#332c26] outline-none transition focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#f8d8e1] disabled:bg-[#f7eee7]"
                      >
                        <option value="">Choisir...</option>
                        {volunteers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {getPersonName(user)} - {user.role === "supervisor" ? "superviseur" : "bénévole"}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(prayer)}
                        disabled={Boolean(prayer.rejectedAt) || isBusy}
                        className="h-10 rounded-lg bg-[#8B1E3F] px-3 text-sm font-semibold text-white transition hover:bg-[#741733] disabled:cursor-not-allowed disabled:bg-[#d8c8bb]"
                      >
                        {hasOwner ? "Réassigner" : "Attribuer"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#f0e2d5] pt-4">
                  {status === "moderation" && (
                    <>
                      <button
                        onClick={() =>
                          performAction(prayer._id, "approve", {}, "Demande approuvée.")
                        }
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#5F8A61] px-3 text-sm font-semibold text-white hover:bg-[#4d744f] disabled:bg-[#d8c8bb]"
                      >
                        <FiCheck />
                        Approuver
                      </button>
                      <button
                        onClick={() =>
                          confirmAndRun({
                            prayerId: prayer._id,
                            action: "reject",
                            title: "Rejeter cette demande ?",
                            text: "Elle sera retirée des espaces actifs mais restera visible ici.",
                            successMessage: "Demande rejetée.",
                          })
                        }
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#A3193F] px-3 text-sm font-semibold text-white hover:bg-[#871433] disabled:bg-[#d8c8bb]"
                      >
                        <FiX />
                        Rejeter
                      </button>
                    </>
                  )}

                  {status === "rejected" && (
                    <button
                      onClick={() => performAction(prayer._id, "restore", {}, "Demande restaurée.")}
                      disabled={isBusy}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#8B1E3F] px-3 text-sm font-semibold text-white hover:bg-[#741733] disabled:bg-[#d8c8bb]"
                    >
                      <FiRefreshCcw />
                      Restaurer
                    </button>
                  )}

                  {status === "archived" && (
                    <>
                      <button
                        onClick={() =>
                          performAction(
                            prayer._id,
                            "reopen",
                            { reopenMode: "keep" },
                            "Prière réouverte chez le responsable."
                          )
                        }
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0F766E] px-3 text-sm font-semibold text-white hover:bg-[#0c625c] disabled:bg-[#d8c8bb]"
                      >
                        <FiRefreshCcw />
                        Rouvrir
                      </button>
                      <button
                        onClick={() =>
                          performAction(
                            prayer._id,
                            "reopen",
                            { reopenMode: "unassign" },
                            "Prière réouverte et remise à attribuer."
                          )
                        }
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm font-semibold text-[#5f5146] hover:border-[#8B1E3F] hover:text-[#8B1E3F] disabled:text-[#bca999]"
                      >
                        Rouvrir libre
                      </button>
                    </>
                  )}

                  {canUseActiveActions && status !== "archived" && (
                    <button
                      onClick={() =>
                        confirmAndRun({
                          prayerId: prayer._id,
                          action: "archive",
                          title: "Marquer comme terminée ?",
                          text: "La demande passera dans les archives.",
                          successMessage: "Demande archivée.",
                        })
                      }
                      disabled={isBusy}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm font-semibold text-[#5f5146] hover:border-[#8B1E3F] disabled:text-[#bca999]"
                    >
                      <FiArchive />
                      Terminer
                    </button>
                  )}

                  {canUseActiveActions && hasOwner && status !== "archived" && (
                    <button
                      onClick={() =>
                        confirmAndRun({
                          prayerId: prayer._id,
                          action: "release",
                          title: "Libérer cette demande ?",
                          text: "Elle ne sera plus attachée à ce responsable.",
                          successMessage: "Demande libérée.",
                        })
                      }
                      disabled={isBusy}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm font-semibold text-[#5f5146] hover:border-[#8B1E3F] hover:text-[#8B1E3F] disabled:text-[#bca999]"
                    >
                      Libérer
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePrayer(prayer._id)}
                    disabled={isBusy}
                    className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-[#f2c8c8] bg-[#fff1f1] px-3 text-sm font-semibold text-[#9f1239] hover:bg-[#ffe4e6] disabled:text-[#bca999]"
                  >
                    <FiTrash2 />
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {expandedPrayer && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2f2a26]/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prayer-modal-title"
          onClick={() => setExpandedPrayer(null)}
        >
          <div
            className="flex max-h-[78vh] w-full max-w-2xl flex-col rounded-[1.5rem] border border-[#eadfd3] bg-[#fffaf5] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eadfd3] p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E3F]">
                  Demande de prière
                </p>
                <h3 id="prayer-modal-title" className="mt-2 text-xl font-bold text-[#2f2a26]">
                  {expandedPrayer.name || "Demande anonyme"}
                </h3>
                <p className="mt-1 text-sm text-[#7a6b5f]">
                  Reçue le {formatDate(expandedPrayer.datePublication || expandedPrayer.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedPrayer(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#5f5146] transition hover:bg-[#FFF2E7] hover:text-[#8B1E3F]"
                aria-label="Fermer"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4f4339]">
                {expandedPrayer.prayerRequest}
              </p>
            </div>

            <div className="flex justify-end border-t border-[#eadfd3] p-4">
              <button
                type="button"
                onClick={() => setExpandedPrayer(null)}
                className="rounded-lg bg-[#8B1E3F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#741733]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
