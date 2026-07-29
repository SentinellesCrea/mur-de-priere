"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiExternalLink,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiPower,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";
import { CHURCH_DENOMINATIONS, CHURCH_TRADITIONS } from "@/data/churchOptions";

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  country: "France",
  email: "",
  phone: "",
  website: "",
  tradition: "Évangélique",
  denomination: "",
  languages: "Français",
  serviceTimes: "",
  description: "",
  accessibility: false,
  childrenWelcome: false,
};

function getStatus(church) {
  if (
    church.disabledAt ||
    church.archivedAt ||
    ["disabled", "archived"].includes(church.status)
  ) {
    return "disabled";
  }
  if (church.rejectedAt || church.status === "rejected") return "rejected";
  if (church.isValidated || church.status === "validated") return "validated";
  return "pending";
}

const STATUS_LABELS = {
  all: "Toutes",
  pending: "À valider",
  validated: "Publiées",
  disabled: "Désactivées",
  rejected: "Refusées",
};

const PAGE_SIZE = 12;

function getOrigin(church) {
  if (church.source === "impactcentrechretien") return "impactcentrechretien";
  if (church.source === "openstreetmap") return "openstreetmap";
  return church.submittedBy === "admin" ? "admin" : "registration";
}

function safeWebsite(value) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

const ORIGIN_LABELS = {
  admin: "Ajout admin",
  registration: "Inscription",
  openstreetmap: "OpenStreetMap",
  impactcentrechretien: "Annuaire officiel ICC",
};

export default function AdminChurchesPage({ onPendingCountChange }) {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [traditionFilter, setTraditionFilter] = useState("all");
  const [networkFilter, setNetworkFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    validated: 0,
    disabled: 0,
    rejected: 0,
  });
  const [networks, setNetworks] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChurch, setEditingChurch] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadChurches = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
        status: activeFilter,
        city: cityFilter,
        tradition: traditionFilter,
        network: networkFilter,
        origin: originFilter,
      });
      if (search.trim()) params.set("search", search.trim());
      const data = await fetchApi(`/api/admin/churches?${params.toString()}`);

      setChurches(data.churches || []);
      setTotal(data.total || 0);
      setPageCount(data.totalPages || 1);
      if ((data.totalPages || 1) < currentPage) {
        setCurrentPage(data.totalPages || 1);
      }
      setCounts(data.counts || {
        all: 0,
        pending: 0,
        validated: 0,
        disabled: 0,
        rejected: 0,
      });
      setNetworks(data.facets?.networks || []);
    } catch (error) {
      toast.error(error.message || "Impossible de charger les églises.");
    } finally {
      setLoading(false);
    }
  }, [
    activeFilter,
    cityFilter,
    currentPage,
    networkFilter,
    originFilter,
    search,
    traditionFilter,
  ]);

  useEffect(() => {
    const timeout = setTimeout(loadChurches, search.trim() ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [loadChurches, search]);

  useEffect(() => {
    onPendingCountChange?.(counts.pending);
  }, [counts.pending, onPendingCountChange]);
  const displayedPage = Math.min(currentPage, pageCount);

  const updateFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const openForm = (church = null) => {
    setIsFormOpen(true);
    setEditingChurch(church);
    setForm(
      church
        ? {
            ...EMPTY_FORM,
            ...church,
            languages: Array.isArray(church.languages)
              ? church.languages.join(", ")
              : church.languages || "",
          }
        : EMPTY_FORM
    );
  };

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const saved = editingChurch
        ? await fetchApi(`/api/admin/churches/${editingChurch._id}`, {
            method: "PUT",
            body: { action: "update", ...form },
          })
        : await fetchApi("/api/admin/churches", {
            method: "POST",
            body: form,
          });

      setChurches((current) =>
        editingChurch
          ? current.map((church) => (church._id === saved._id ? saved : church))
          : [saved, ...current]
      );
      setEditingChurch(null);
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      await loadChurches();
      toast.success(editingChurch ? "Fiche mise à jour." : "Église ajoutée et publiée.");
    } catch (error) {
      toast.error(error.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const performAction = async (church, action, successMessage) => {
    try {
      const updated = await fetchApi(`/api/admin/churches/${church._id}`, {
        method: "PUT",
        body: { action },
      });
      setChurches((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedChurch((current) =>
        current?._id === updated._id ? updated : current
      );
      await loadChurches();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error.message || "Action impossible.");
    }
  };

  const disableChurch = async (church) => {
    const result = await Swal.fire({
      title: "Désactiver cette église ?",
      text: "Elle ne sera plus visible dans l’annuaire public, mais sa fiche restera disponible ici.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B1E3F",
      confirmButtonText: "Désactiver",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;
    await performAction(church, "disable", "Église désactivée et dépubliée.");
  };

  const permanentlyDelete = async (church) => {
    const result = await Swal.fire({
      title: "Supprimer définitivement cette église ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    await fetchApi(`/api/admin/churches/${church._id}`, { method: "DELETE" });
    await loadChurches();
    toast.success("Église supprimée.");
  };

  return (
    <section className="space-y-6 rounded-lg bg-[#fff7ef] p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B1E3F]">
            Annuaire local
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#2f2a26]">Gestion des églises</h2>
          <p className="mt-2 text-sm text-[#6B5B4D]">
            Valider les inscriptions et ajouter directement les communautés absentes du web.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadChurches}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9c7b8] bg-white px-4 text-sm font-semibold text-[#5f5146]"
          >
            <FiRefreshCcw />
            Actualiser
          </button>
          <button
            onClick={() => openForm()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B1E3F] px-4 text-sm font-semibold text-white"
          >
            <FiPlus />
            Ajouter une église
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button
            key={status}
            onClick={() => updateFilter(setActiveFilter, status)}
            className={`rounded-lg border p-4 text-left shadow-sm ${
              activeFilter === status
                ? "border-[#8B1E3F] bg-[#8B1E3F] text-white"
                : "border-[#eadfd3] bg-white text-[#2f2a26]"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
            <span className="mt-2 block text-2xl font-bold">{counts[status]}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#eadfd3] bg-white p-4 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a58a75]" />
          <input
            value={search}
            onChange={(event) => updateFilter(setSearch, event.target.value)}
            placeholder="Rechercher par nom, adresse, ville ou confession..."
            className="h-11 w-full rounded-lg border border-[#d9c7b8] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#8B1E3F]"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <FilterTextInput
            label="Ville"
            value={cityFilter}
            onChange={(value) => updateFilter(setCityFilter, value)}
            placeholder="Toutes les villes"
          />
          <FilterSelect
            label="Famille"
            value={traditionFilter}
            onChange={(value) => updateFilter(setTraditionFilter, value)}
            options={CHURCH_TRADITIONS}
            allLabel="Toutes les familles"
          />
          <FilterSelect
            label="Réseau"
            value={networkFilter}
            onChange={(value) => updateFilter(setNetworkFilter, value)}
            options={networks}
            allLabel="Tous les réseaux"
          />
          <FilterSelect
            label="Origine"
            value={originFilter}
            onChange={(value) => updateFilter(setOriginFilter, value)}
            options={Object.keys(ORIGIN_LABELS)}
            optionLabels={ORIGIN_LABELS}
            allLabel="Toutes les origines"
          />
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCityFilter("all");
              setTraditionFilter("all");
              setNetworkFilter("all");
              setOriginFilter("all");
              setCurrentPage(1);
            }}
            className="mt-auto h-11 rounded-lg border border-[#d9c7b8] bg-[#fffaf5] px-3 text-sm font-semibold text-[#6B5B4D] hover:bg-[#fff2e7]"
          >
            Réinitialiser les filtres
          </button>
        </div>
        <p className="mt-3 text-xs font-medium text-[#8a7768]">
          {total} résultat{total > 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p className="rounded-lg bg-white p-8 text-center text-[#7a6b5f]">Chargement…</p>
      ) : churches.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#d9c7b8] bg-white p-8 text-center text-[#7a6b5f]">
          Aucune église dans cette vue.
        </p>
      ) : (
        <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {churches.map((church) => {
            const status = getStatus(church);
            return (
              <article
                key={church._id}
                onClick={() => setSelectedChurch(church)}
                className="group flex cursor-pointer flex-col rounded-xl border border-[#eadfd3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfae99] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="rounded-md bg-[#f4ece5] px-2 py-1 text-xs font-bold text-[#7a3f24]">
                      {STATUS_LABELS[status]}
                    </span>
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-[#2f2a26]">
                      {church.name}
                    </h3>
                    <p className="mt-1 flex items-start gap-2 text-sm text-[#6B5B4D]">
                      <FiMapPin className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">
                        {[church.address, church.postalCode, church.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#8B1E3F]">
                      {[church.tradition, church.denomination].filter(Boolean).join(" · ")}
                    </p>
                    {church.networkName && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6D5A8D]">
                        Réseau : {church.networkName}
                      </p>
                    )}
                    {church.submittedBy && (
                      <p className="mt-2 text-xs text-[#8a7768]">
                        Origine : {ORIGIN_LABELS[getOrigin(church)]}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      openForm(church);
                    }}
                    className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
                    aria-label={`Modifier ${church.name}`}
                  >
                    <FiEdit2 />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 border-t border-[#f0e2d5] pt-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedChurch(church);
                    }}
                    className="sr-only focus:not-sr-only focus:rounded-lg focus:bg-gray-100 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
                  >
                    Ouvrir la fiche de {church.name}
                  </button>
                  {status === "pending" && (
                    <>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          performAction(church, "validate", "Église publiée.");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#5F8A61] px-3 py-2 text-sm font-semibold text-white"
                      >
                        <FiCheck /> Valider
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          performAction(church, "reject", "Inscription refusée.");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#A3193F] px-3 py-2 text-sm font-semibold text-white"
                      >
                        <FiX /> Refuser
                      </button>
                    </>
                  )}
                  {status === "validated" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        disableChurch(church);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                    >
                      <FiPower /> Désactiver
                    </button>
                  )}
                  {status === "disabled" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        performAction(church, "activate", "Église réactivée et publiée.");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#8B1E3F] px-3 py-2 text-sm font-semibold text-white"
                    >
                      <FiPower /> Réactiver
                    </button>
                  )}
                  {status === "rejected" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        performAction(church, "validate", "Église validée et publiée.");
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#8B1E3F] px-3 py-2 text-sm font-semibold text-white"
                    >
                      <FiCheck /> Valider
                    </button>
                  )}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      permanentlyDelete(church);
                    }}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    <FiTrash2 /> Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {pageCount > 1 && (
          <Pagination
            currentPage={displayedPage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        )}
        </>
      )}

      {selectedChurch && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedChurch(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="church-details-title"
            className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-[#f4ece5] px-2 py-1 text-xs font-bold text-[#7a3f24]">
                  {STATUS_LABELS[getStatus(selectedChurch)]}
                </span>
                <h3
                  id="church-details-title"
                  className="mt-3 text-2xl font-bold text-[#2f2a26]"
                >
                  {selectedChurch.name}
                </h3>
                <p className="mt-2 font-semibold text-[#8B1E3F]">
                  {[selectedChurch.tradition, selectedChurch.denomination]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChurch(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Fermer la fiche"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 space-y-3 rounded-xl bg-[#fffaf5] p-4 text-sm text-[#5f5146]">
              <DetailLine icon={FiMapPin}>
                {[selectedChurch.address, selectedChurch.postalCode, selectedChurch.city]
                  .filter(Boolean)
                  .join(", ")}
                {selectedChurch.country ? `, ${selectedChurch.country}` : ""}
              </DetailLine>
              {selectedChurch.email && (
                <DetailLine icon={FiMail}>
                  <a className="underline" href={`mailto:${selectedChurch.email}`}>
                    {selectedChurch.email}
                  </a>
                </DetailLine>
              )}
              {selectedChurch.phone && (
                <DetailLine icon={FiPhone}>
                  <a className="underline" href={`tel:${selectedChurch.phone}`}>
                    {selectedChurch.phone}
                  </a>
                </DetailLine>
              )}
              {selectedChurch.website && (
                <DetailLine icon={FiGlobe}>
                  {safeWebsite(selectedChurch.website) ? (
                    <a
                      className="break-all underline"
                      href={safeWebsite(selectedChurch.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedChurch.website}
                    </a>
                  ) : (
                    <span className="break-all">{selectedChurch.website}</span>
                  )}
                </DetailLine>
              )}
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <DetailValue
                label="Origine"
                value={ORIGIN_LABELS[getOrigin(selectedChurch)]}
              />
              <DetailValue
                label="Réseau"
                value={selectedChurch.networkName || "Indépendante"}
              />
              {selectedChurch.leaderName && (
                <DetailValue
                  label="Responsable"
                  value={selectedChurch.leaderName}
                />
              )}
              <DetailValue
                label="Langues"
                value={selectedChurch.languages?.join(", ") || "Non renseignées"}
              />
              <DetailValue
                label="Accueil des enfants"
                value={selectedChurch.childrenWelcome ? "Oui" : "Non renseigné"}
              />
              <DetailValue
                label="Accessibilité PMR"
                value={selectedChurch.accessibility ? "Oui" : "Non renseignée"}
              />
            </dl>

            {selectedChurch.serviceTimes && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#9b806d]">
                  Horaires
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#5f5146]">
                  {selectedChurch.serviceTimes}
                </p>
              </div>
            )}
            {selectedChurch.description && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#9b806d]">
                  Présentation
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#5f5146]">
                  {selectedChurch.description}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  openForm(selectedChurch);
                  setSelectedChurch(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
              >
                <FiEdit2 /> Modifier
              </button>
              {selectedChurch.sourceUrl && (
                <a
                  href={selectedChurch.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
                >
                  <FiExternalLink /> Voir la source
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedChurch(null)}
                className="ml-auto rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitForm}
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#2f2a26]">
                  {editingChurch ? "Modifier l’église" : "Ajouter une église"}
                </h3>
                <p className="mt-1 text-sm text-[#7a6b5f]">
                  L’adresse sera automatiquement positionnée sur la carte.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingChurch(null);
                  setForm(EMPTY_FORM);
                }}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ChurchInput label="Nom *" name="name" form={form} setForm={setForm} required />
              <ChurchInput label="Email" name="email" type="email" form={form} setForm={setForm} />
              <ChurchInput label="Téléphone" name="phone" form={form} setForm={setForm} />
              <ChurchInput label="Site web" name="website" form={form} setForm={setForm} />
              <div className="md:col-span-2">
                <ChurchInput label="Adresse *" name="address" form={form} setForm={setForm} required />
              </div>
              <ChurchInput label="Code postal" name="postalCode" form={form} setForm={setForm} />
              <ChurchInput label="Ville" name="city" form={form} setForm={setForm} />
              <ChurchInput label="Pays" name="country" form={form} setForm={setForm} />
              <label className="text-sm font-semibold text-[#5f5146]">
                Famille
                <select
                  value={form.tradition}
                  onChange={(event) => setForm((current) => ({ ...current, tradition: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                >
                  {CHURCH_TRADITIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-[#5f5146]">
                Dénomination
                <input
                  list="church-denominations"
                  value={form.denomination}
                  onChange={(event) => setForm((current) => ({ ...current, denomination: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>
              <ChurchInput label="Langues (séparées par des virgules)" name="languages" form={form} setForm={setForm} />
              <ChurchInput label="Horaires des cultes" name="serviceTimes" form={form} setForm={setForm} />
              <label className="text-sm font-semibold text-[#5f5146] md:col-span-2">
                Présentation
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 w-full rounded-lg border p-3 font-normal"
                />
              </label>
            </div>
            <datalist id="church-denominations">
              {CHURCH_DENOMINATIONS.map((item) => <option key={item} value={item} />)}
            </datalist>

            <div className="mt-4 flex flex-wrap gap-4">
              <ChurchCheckbox label="Accueil des enfants" name="childrenWelcome" form={form} setForm={setForm} />
              <ChurchCheckbox label="Accessible PMR" name="accessibility" form={form} setForm={setForm} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingChurch(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-gray-700"
              >
                Annuler
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-[#8B1E3F] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function ChurchInput({ label, name, type = "text", form, setForm, required = false }) {
  return (
    <label className="text-sm font-semibold text-[#5f5146]">
      {label}
      <input
        type={type}
        required={required}
        value={form[name] || ""}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
      />
    </label>
  );
}

function ChurchCheckbox({ label, name, form, setForm }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-[#5f5146]">
      <input
        type="checkbox"
        checked={form[name] === true}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.checked }))}
      />
      {label}
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  optionLabels = {},
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wide text-[#8a7768]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#4f443b] outline-none focus:border-[#8B1E3F]"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterTextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wide text-[#8a7768]">
      {label}
      <input
        value={value === "all" ? "" : value}
        onChange={(event) => onChange(event.target.value || "all")}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-lg border border-[#d9c7b8] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[#4f443b] outline-none focus:border-[#8B1E3F]"
      />
    </label>
  );
}

function Pagination({ currentPage, pageCount, onPageChange }) {
  const visiblePages = [
    ...new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, pageCount].filter(
        (page) => page >= 1 && page <= pageCount
      )
    ),
  ].sort((a, b) => a - b);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination des églises"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-10 items-center gap-1 rounded-lg border bg-white px-3 text-sm font-semibold text-[#5f5146] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronLeft /> Précédent
      </button>
      {visiblePages.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - visiblePages[index - 1] > 1 && (
            <span className="px-1 text-[#8a7768]">…</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold ${
              page === currentPage
                ? "bg-[#8B1E3F] text-white"
                : "border bg-white text-[#5f5146]"
            }`}
          >
            {page}
          </button>
        </span>
      ))}
      <button
        type="button"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-10 items-center gap-1 rounded-lg border bg-white px-3 text-sm font-semibold text-[#5f5146] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Suivant <FiChevronRight />
      </button>
    </nav>
  );
}

function DetailLine({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 shrink-0 text-[#8B1E3F]" />
      <span>{children}</span>
    </div>
  );
}

function DetailValue({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-[#9b806d]">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-[#4f443b]">{value}</dd>
    </div>
  );
}
