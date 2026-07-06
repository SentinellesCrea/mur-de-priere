"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { FiImage, FiLink, FiSave, FiTrash2 } from "react-icons/fi";
import BlocksEditor from "./BlocksEditor";
import ResourcePreview from "./ResourcePreview";
import { uploadCloudinaryImage } from "./uploadCloudinaryImage";

const STORAGE_KEY = "resource-form-draft";
const AUTOSAVE_VERSION = 1;

function hasDraftContent(fields = {}) {
  return Boolean(
    fields.title?.trim()
      || fields.slug?.trim()
      || fields.excerpt?.trim()
      || fields.coverImage?.trim()
      || fields.blocks?.length
  );
}

function readLocalDraft(storageKey) {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    const fields = parsed?.fields || parsed;
    return hasDraftContent(fields) ? fields : null;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function writeLocalDraft(storageKey, fields) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: AUTOSAVE_VERSION,
        savedAt: new Date().toISOString(),
        fields,
      })
    );
    return true;
  } catch (error) {
    console.error("Erreur sauvegarde locale ressource", error);
    return false;
  }
}

function removeLocalDraft(storageKey) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}

export default function ResourceForm({
  initialData = null,
  onSubmit,
  loading = false,
}) {
  const [hydrated, setHydrated] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState(initialData?.category || "priere");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [blocks, setBlocks] = useState(initialData?.blocks || []);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const resourceId = initialData?._id || "";
  const isExistingResource = Boolean(resourceId);
  const storageKey = resourceId
    ? `${STORAGE_KEY}-${resourceId}`
    : STORAGE_KEY;

  const draftSnapshot = useMemo(() => ({
    title,
    slug,
    category,
    status,
    excerpt,
    coverImage,
    blocks,
  }), [title, slug, category, status, excerpt, coverImage, blocks]);

  const applyResourceData = useCallback((data = {}) => {
    setTitle(data.title || "");
    setSlug(data.slug || "");
    setCategory(data.category || "priere");
    setStatus(data.status || "draft");
    setExcerpt(data.excerpt || "");
    setCoverImage(data.coverImage || "");
    setBlocks(data.blocks || []);
  }, []);

  /* ================= LOAD DRAFT ================= */
  useEffect(() => {
    startTransition(() => {
      const savedDraft = readLocalDraft(storageKey);

      if (savedDraft) {
        applyResourceData(savedDraft);
        setAutosaveStatus("restored");
      } else if (isExistingResource) {
        applyResourceData(initialData);
      }

      setHydrated(true);
    });
  }, [applyResourceData, initialData, isExistingResource, storageKey]);

  /* ================= SAVE DRAFT ================= */
  useEffect(() => {
    if (!hydrated) return;

    const timeout = window.setTimeout(() => {
      if (!isExistingResource && !hasDraftContent(draftSnapshot)) {
        removeLocalDraft(storageKey);
        setAutosaveStatus("idle");
        return;
      }

      const saved = writeLocalDraft(storageKey, draftSnapshot);
      setAutosaveStatus(saved ? "saved" : "error");
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [draftSnapshot, hydrated, isExistingResource, storageKey]);

  useEffect(() => {
    if (!hydrated) return undefined;

    const saveBeforeUnload = () => {
      if (!isExistingResource && !hasDraftContent(draftSnapshot)) return;
      writeLocalDraft(storageKey, draftSnapshot);
    };

    window.addEventListener("beforeunload", saveBeforeUnload);
    return () => window.removeEventListener("beforeunload", saveBeforeUnload);
  }, [draftSnapshot, hydrated, isExistingResource, storageKey]);

  if (!hydrated) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await onSubmit?.({
      title,
      slug,
      category,
      status,
      excerpt,
      coverImage,
      blocks,
    });

    if (saved !== false) {
      removeLocalDraft(storageKey);
      setAutosaveStatus("idle");
    }
  };

  const resourcePreview = {
    title,
    slug,
    category,
    excerpt,
    coverImage,
    blocks,
    status,
  };

  /* ================= AUTO SLUG ================= */
  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] gap-8 xl:gap-10 items-start">
      {/* ================= LEFT : FORM ================= */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFOS */}
        <section className="bg-white rounded-[1.75rem] p-5 sm:p-7 shadow-sm border border-[#E7E0D8] space-y-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5c40e7] mb-2">
              Affichage public
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="font-extrabold text-xl text-gray-950">Présentation publique</h2>
              <AutosaveBadge status={autosaveStatus} />
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Ces informations alimentent les cartes et listes publiques. Le contenu ouvert par le lecteur se construit avec les blocs ci-dessous.
            </p>
          </div>

          {/* title */}
          <div>
            <label className="text-sm font-extrabold text-gray-800">Titre</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(generateSlug(e.target.value));
              }}
              required
              maxLength={200}
              placeholder="Ex. Retrouver la paix dans la prière"
              className="mt-2 w-full rounded-2xl border border-[#E6DED6] bg-[#FBFAF7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#5c40e7] focus:bg-white focus:ring-4 focus:ring-[#5c40e7]/10"
            />
          </div>

          {/* slug */}
          <div>
            <label className="text-sm font-extrabold text-gray-800">Adresse publique</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#E6DED6] bg-[#F3F0EA] px-4 py-3 text-sm text-gray-500">
              <FiLink className="shrink-0 text-[#5c40e7]" />
              <span className="truncate">
                /ressources/{slug || "adresse-generee-automatiquement"}
              </span>
            </div>
          </div>

          {/* category */}
          <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-extrabold text-gray-800">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#E6DED6] bg-[#FBFAF7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#5c40e7] focus:bg-white focus:ring-4 focus:ring-[#5c40e7]/10"
            >
              <option value="priere">Prière</option>
              <option value="meditation">Méditation</option>
              <option value="encouragement">Encouragement</option>
              <option value="enseignement">Enseignement</option>
              <option value="foi">Foi</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          {/* status */}
          <div>
            <label className="text-sm font-extrabold text-gray-800">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#E6DED6] bg-[#FBFAF7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#5c40e7] focus:bg-white focus:ring-4 focus:ring-[#5c40e7]/10"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
          </div>

          {/* excerpt */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-extrabold text-gray-800">Extrait</label>
              <span className="text-xs font-bold text-gray-400">{excerpt.length}/300</span>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Un court résumé qui apparaîtra dans la liste des ressources."
              className="mt-2 w-full resize-none rounded-2xl border border-[#E6DED6] bg-[#FBFAF7] px-4 py-3 text-sm outline-none transition focus:border-[#5c40e7] focus:bg-white focus:ring-4 focus:ring-[#5c40e7]/10"
            />
          </div>

          {/* cover image */}
          <div>
            <label className="text-sm font-extrabold text-gray-800">Image de couverture</label>
            {coverImage ? (
              <div className="mt-3 overflow-hidden rounded-3xl border border-[#E6DED6] bg-[#F3F0EA]">
                <img
                  src={coverImage}
                  alt=""
                  className="h-52 w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-3 flex h-40 items-center justify-center rounded-3xl border border-dashed border-[#D8CEC2] bg-[#FBFAF7] text-gray-400">
                <FiImage className="text-2xl" />
              </div>
            )}
            <input
              value={coverImage}
              readOnly
              placeholder="L’URL Cloudinary apparaîtra ici après import"
              className="mt-3 w-full rounded-2xl border border-[#E6DED6] bg-[#F3F0EA] px-4 py-3 text-sm text-gray-500 outline-none"
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingCover}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  setUploadingCover(true);
                  const url = await uploadCloudinaryImage(file, "ressources");
                  setCoverImage(url);
                } catch (error) {
                  alert(error.message || "Erreur upload image");
                } finally {
                  setUploadingCover(false);
                  e.target.value = "";
                }
              }}
              className="mt-3 w-full rounded-2xl border border-[#E6DED6] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#5c40e7] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            {uploadingCover && (
              <p className="text-xs text-gray-500 mt-1">Upload en cours...</p>
            )}
          </div>
        </section>

        {/* BLOCKS */}
        <section className="bg-white rounded-[1.75rem] p-5 sm:p-7 shadow-sm border border-[#E7E0D8] space-y-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5c40e7] mb-2">
              Contenu
            </p>
            <h2 className="font-extrabold text-xl text-gray-950">Blocs de la ressource</h2>
          </div>
          <BlocksEditor blocks={blocks} onChange={setBlocks} />
        </section>

        {/* ACTIONS */}
        <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row justify-between gap-3 rounded-[1.5rem] border border-[#E7E0D8] bg-white/90 p-3 shadow-lg shadow-black/5 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              if (confirm("Annuler la création de la ressource ?")) {
                removeLocalDraft(storageKey);
                applyResourceData(initialData || {});
                setAutosaveStatus("idle");
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E6DED6] bg-[#F7F3ED] px-4 py-3 text-sm font-extrabold text-gray-600 hover:bg-white transition"
          >
            <FiTrash2 />
            Repartir à zéro
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 bg-[#5c40e7] text-white px-6 py-3 rounded-2xl font-extrabold transition
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5c40e7]/20"}
            `}
          >
            <FiSave />
            {loading ? "Enregistrement..." : "Enregistrer la ressource"}
          </button>
        </div>
      </form>

      {/* ================= RIGHT : PREVIEW ================= */}
      <div className="xl:sticky xl:top-6 self-start">
        <ResourcePreview resource={resourcePreview} />
      </div>
    </div>
  );

}

function AutosaveBadge({ status }) {
  const labels = {
    restored: "Brouillon local restauré",
    saved: "Sauvegardé localement",
    error: "Sauvegarde locale impossible",
  };

  if (!labels[status]) return null;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        status === "error"
          ? "bg-red-50 text-red-600 border border-red-100"
          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
      }`}
    >
      {labels[status]}
    </span>
  );
}
