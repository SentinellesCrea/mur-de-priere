"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { fetchApi } from "@/lib/fetchApi";

import Navbar from "../../../components/supervisor/SupervisorNavbar"; 

/* ================= PAGE ================= */
export default function EditResourcePage() {
  const { id } = useParams();
  const router = useRouter();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadResource = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/api/supervisor/resources/${id}`);
        setResource(data);
      } catch (err) {
        console.error("Erreur chargement ressource :", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      await fetchApi(`/api/supervisor/resources/${id}`, {
        method: "PUT",
        body: resource,
      });

      alert("Ressource mise à jour");
    } catch (err) {
      console.error("Erreur sauvegarde :", err.message);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return <p className="p-10 text-center">Chargement…</p>;
  }

  if (error || !resource) {
    return <p className="p-10 text-center">Ressource introuvable</p>;
  }

  /* ================= RENDER ================= */

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold mb-6">
          Modifier la ressource
        </h1>

        {/* ================= FORM ================= */}
        <div className="space-y-4">

          <input
            type="text"
            value={resource.title || ""}
            onChange={(e) =>
              setResource({ ...resource, title: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
            placeholder="Titre"
          />

          <textarea
            value={resource.excerpt || ""}
            onChange={(e) =>
              setResource({ ...resource, excerpt: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
            placeholder="Extrait"
          />

          <input
            type="text"
            value={resource.slug || ""}
            onChange={(e) =>
              setResource({ ...resource, slug: e.target.value })
            }
            className="w-full border px-4 py-2 rounded"
            placeholder="Slug"
          />

        </div>

        {/* ================= ACTIONS ================= */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#d8947c] text-white rounded font-bold"
          >
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-2 border rounded"
          >
            Annuler
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
