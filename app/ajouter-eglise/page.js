"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button  from "../components/ui/button";
import { fetchApi } from "@/lib/fetchApi";
import FindChurchHeader from "../trouver-eglise/components/FindChurchHeader";
import Footer from "../components/Footer";

export default function AjouterEglisePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, address } = formData;
    if (!name || !address) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      await fetchApi("/api/churches", {
        method: "POST",
        body: {
          ...formData,
          coordinates: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          },
        },
      });

      toast.success("Votre église a bien été enregistrée. Elle sera visible après validation.");
      router.push("/trouver-eglise");
    } catch (err) {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <FindChurchHeader />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Ajouter votre église</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" onChange={handleChange} value={formData.name} required placeholder="Nom de l'église *" className="input" />
            <input name="email" onChange={handleChange} value={formData.email} placeholder="Email" className="input" />
            <input name="phone" onChange={handleChange} value={formData.phone} placeholder="Téléphone" className="input" />
            <input name="website" onChange={handleChange} value={formData.website} placeholder="Site web" className="input" />
          </div>

          <input name="address" onChange={handleChange} value={formData.address} required placeholder="Adresse complète *" className="input w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="city" onChange={handleChange} value={formData.city} placeholder="Ville" className="input" />
            <input name="postalCode" onChange={handleChange} value={formData.postalCode} placeholder="Code postal" className="input" />
            <input name="country" onChange={handleChange} value={formData.country} placeholder="Pays" className="input" />
          </div>

          <Button type="submit" className="text-white font-semibold px-6 py-3 rounded-lg">
            Envoyer ma demande
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
