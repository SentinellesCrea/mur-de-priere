"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

import Navbar from "../../../components/supervisor/SupervisorNavbar"; 

import ResourceForm from "../../components/dashboard/resources/ResourceForm";

export default function CreateResourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (payload) => {
    try {
      setLoading(true);

      const resource = await fetchApi("/api/supervisor/resources", {
        method: "POST",
        body: payload,
      });

      toast.success("Ressource créée avec succès 🙌");

      // 👉 redirection logique
      window.open(`/ressources/${resource.slug}`, "_blank");

    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Erreur lors de la création de la ressource"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6] px-6 py-10">
      <Navbar />
      <div className="max-w-[1400px] mx-auto py-14 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold">
            Créer une ressource
          </h1>
          <p className="text-gray-500">
            Rédigez un enseignement, une méditation ou une ressource spirituelle.
          </p>
        </header>

        <ResourceForm
          onSubmit={handleCreate}
          loading={loading}
        />
      </div>
    </div>
  );
}
