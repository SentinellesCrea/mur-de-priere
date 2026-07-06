"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiLayers,
} from "react-icons/fi";

import Navbar from "../../../components/supervisor/SupervisorNavbar"; 

import ResourceForm from "../../components/dashboard/resources/ResourceForm";

const SAFE_RESOURCE_REF = /^[a-z0-9][a-z0-9-]{0,120}$/i;

function publicResourceRef(resource) {
  return SAFE_RESOURCE_REF.test(resource?.slug || "")
    ? resource.slug
    : resource?._id;
}

export default function CreateResourcePage() {
  const [loading, setLoading] = useState(false);
  const [existingResources, setExistingResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetchApi("/api/supervisor/resources");

        if (!cancelled) {
          setExistingResources(res.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement ressources superviseur", error);
      } finally {
        if (!cancelled) {
          setResourcesLoading(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const handleCreate = async (payload) => {
    try {
      setLoading(true);

      const resource = await fetchApi(
        editingResource?._id
          ? `/api/supervisor/resources/${editingResource._id}`
          : "/api/supervisor/resources",
        {
        method: editingResource?._id ? "PUT" : "POST",
        body: payload,
        }
      );

      toast.success(
        editingResource?._id
          ? "Ressource mise à jour avec succès 🙌"
          : "Ressource créée avec succès 🙌"
      );

      // 👉 redirection logique
      const publicRef = publicResourceRef(resource);
      if (resource.status === "published" && publicRef) {
        window.open(`/ressources/${publicRef}`, "_blank");
      }

      setExistingResources((prev) => [
        resource,
        ...prev.filter((item) => item._id !== resource._id),
      ]);
      setEditingResource(resource);
      return true;

    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Erreur lors de la création de la ressource"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    window.requestAnimationFrame(() => {
      document.getElementById("resource-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE]">
      <Navbar />
      <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16 space-y-10">
        <Link
          href="/supervisor/dashboard?tab=resources"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-[#5c40e7] shadow-sm border border-[#E7E0D8] hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <FiArrowLeft />
          Retour aux ressources
        </Link>

        <header className="overflow-hidden rounded-[2rem] bg-white border border-[#E7E0D8] shadow-sm">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-7 sm:p-9 lg:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#5c40e7] mb-4">
                Bibliothèque superviseur
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
                Créer une ressource
              </h1>
              <p className="text-gray-600 mt-3 max-w-2xl leading-7">
                Préparez un enseignement, une méditation ou un support spirituel avec un aperçu en direct avant publication.
              </p>
            </div>

            <div className="bg-[#171427] text-white p-7 sm:p-9 lg:p-10 flex flex-col justify-center gap-5">
              <HeaderPoint icon={<FiBookOpen />} title="Structure claire" text="Construisez la ressource avec des blocs adaptés." />
              <HeaderPoint icon={<FiLayers />} title="Brouillon gardé" text="Votre contenu reste en local tant qu’il n’est pas publié." />
              <HeaderPoint icon={<FiCheckCircle />} title="Publication maîtrisée" text="Choisissez brouillon ou publié au moment d’enregistrer." />
            </div>
          </div>
        </header>

        <ExistingResourcesList
          resources={existingResources}
          loading={resourcesLoading}
          onEdit={handleEditResource}
        />

        <div id="resource-form">
          {editingResource && (
            <div className="mb-4 flex flex-col gap-3 rounded-[1.5rem] border border-[#E7E0D8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-extrabold text-gray-700">
                Modification de : <span className="text-[#5c40e7]">{editingResource.title}</span>
              </p>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="w-fit rounded-full border border-[#E7E0D8] px-4 py-2 text-xs font-extrabold text-gray-500 hover:text-[#5c40e7]"
              >
                Créer une nouvelle ressource
              </button>
            </div>
          )}

          <ResourceForm
            key={editingResource?._id || "new-resource"}
            initialData={editingResource}
            onSubmit={handleCreate}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

function ExistingResourcesList({ resources, loading, onEdit }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === "undefined") return 4;
    return window.matchMedia("(min-width: 640px)").matches ? 6 : 4;
  });
  const totalPages = Math.max(1, Math.ceil(resources.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const syncPageSize = () => {
      setPageSize(mediaQuery.matches ? 6 : 4);
    };

    syncPageSize();
    mediaQuery.addEventListener("change", syncPageSize);

    return () => mediaQuery.removeEventListener("change", syncPageSize);
  }, []);

  const visibleResources = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return resources.slice(start, start + pageSize);
  }, [pageSize, safePage, resources]);

  if (loading) {
    return (
      <section className="rounded-[1.75rem] border border-[#E7E0D8] bg-white/75 p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-400">Chargement des ressources existantes...</p>
      </section>
    );
  }

  if (resources.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-[#D8CEC2] bg-white/75 p-5 shadow-sm">
        <p className="text-sm font-extrabold text-gray-700">
          Aucune ressource créée pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-[#E7E0D8] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#5c40e7]">
            Déjà créées
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-gray-950">
            Ressources existantes
          </h2>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="flex size-8 items-center justify-center rounded-full border border-[#E7E0D8] text-gray-400 transition hover:text-[#5c40e7] disabled:opacity-30"
              aria-label="Ressources précédentes"
            >
              <FiChevronLeft />
            </button>
            <span className="text-xs font-extrabold text-gray-400">
              {safePage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="flex size-8 items-center justify-center rounded-full border border-[#E7E0D8] text-gray-400 transition hover:text-[#5c40e7] disabled:opacity-30"
              aria-label="Ressources suivantes"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleResources.map((resource) => {
          const isDraft = resource.status === "draft";
          const isArchived = resource.status === "archived";
          const href =
            resource.status === "published" && publicResourceRef(resource)
              ? `/ressources/${publicResourceRef(resource)}`
              : `/supervisor/resources/${resource._id}`;
          const actionLabel = isDraft
            ? "Continuer"
            : isArchived
              ? "Reprendre"
              : "Modifier";

          return (
            <div
              key={resource._id}
              className="group rounded-2xl border border-[#E7E0D8] bg-[#FBFAF7] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#5c40e7]/30 hover:bg-[#F4F1FF]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <Link href={href} className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-gray-900 group-hover:text-[#5c40e7]">
                    {resource.title || "Ressource sans titre"}
                  </span>
                </Link>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${
                  isDraft
                    ? "bg-amber-50 text-amber-600"
                    : isArchived
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-50 text-emerald-600"
                }`}>
                  {isDraft ? "Brouillon" : isArchived ? "Archivé" : "Publié"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onEdit(resource)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-[#5c40e7] shadow-sm border border-[#E7E0D8] transition hover:bg-[#5c40e7] hover:text-white"
              >
                <FiEdit2 />
                {actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HeaderPoint({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#F3C9A7]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-extrabold">{title}</span>
        <span className="block text-xs leading-5 text-white/65">{text}</span>
      </span>
    </div>
  );
}
