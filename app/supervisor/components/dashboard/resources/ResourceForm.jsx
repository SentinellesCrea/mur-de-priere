"use client";

import { useState, useEffect } from "react";
import BlocksEditor from "./BlocksEditor";
import ResourcePreview from "./ResourcePreview";

const STORAGE_KEY = "resource-form-draft";

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

  /* ================= LOAD DRAFT ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const draft = JSON.parse(saved);
      setTitle(draft.title || "");
      setSlug(draft.slug || "");
      setCategory(draft.category || "priere");
      setStatus(draft.status || "draft");
      setExcerpt(draft.excerpt || "");
      setCoverImage(draft.coverImage || "");
      setBlocks(draft.blocks || []);
    }
    setHydrated(true);
  }, []);

  /* ================= SAVE DRAFT ================= */
  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title,
        slug,
        category,
        status,
        excerpt,
        coverImage,
        blocks,
      })
    );
  }, [hydrated, title, slug, category, status, excerpt, coverImage, blocks]);

  if (!hydrated) return null;

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit?.({
      title,
      slug,
      category,
      status,
      excerpt,
      coverImage,
      blocks,
    });
    localStorage.removeItem(STORAGE_KEY);
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      {/* ================= LEFT : FORM ================= */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* INFOS */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-lg">Informations générales</h2>

          {/* title */}
          <div>
            <label className="text-sm font-semibold">Titre</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(generateSlug(e.target.value));
              }}
              required
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* slug */}
          <div>
            <label className="text-sm font-semibold">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* category */}
          <div>
            <label className="text-sm font-semibold">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-2"
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
            <label className="text-sm font-semibold">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-2"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>

          {/* excerpt */}
          <div>
            <label className="text-sm font-semibold">Extrait</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={300}
              rows={3}
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* cover image */}
          <div>
            <label className="text-sm font-semibold">Image de couverture</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-1 w-full border rounded-lg px-4 py-2"
            />
          </div>
        </section>

        {/* BLOCKS */}
        <section className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="font-bold text-lg">Contenu</h2>
          <BlocksEditor blocks={blocks} onChange={setBlocks} />
        </section>

        {/* ACTIONS */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm("Annuler la création de la ressource ?")) {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-blue-50 rounded-full border text-gray-600"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#d8947c] text-white px-6 py-3 rounded-full font-bold transition
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}
            `}
          >
            {loading ? "Enregistrement..." : "Enregistrer la ressource"}
          </button>
        </div>
      </form>

      {/* ================= RIGHT : PREVIEW ================= */}
      <div className="sticky top-6 self-start py-16">
        <ResourcePreview resource={resourcePreview} />
      </div>
    </div>
  );

}
