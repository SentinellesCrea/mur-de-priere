"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button from "../components/ui/button";
import { fetchApi } from "@/lib/fetchApi";
import FindChurchHeader from "../trouver-eglise/components/FindChurchHeader";
import Footer from "../components/Footer";
import { CHURCH_DENOMINATIONS, CHURCH_TRADITIONS } from "@/data/churchOptions";

export default function AjouterEglisePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      await fetchApi("/api/churches", {
        method: "POST",
        body: formData, // ✅ plus besoin d'envoyer lat/lng
      });

      toast.success("Votre église a bien été enregistrée. Elle sera visible après validation.");
      router.push("/trouver-eglise");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <FindChurchHeader />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Ajouter votre église</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              required
              placeholder="Nom de l'église *"
              className="input"
              onChange={handleChange}
              value={formData.name}
            />
            <input
              name="email"
              placeholder="Email"
              className="input"
              onChange={handleChange}
              value={formData.email}
            />
            <input
              name="phone"
              placeholder="Téléphone"
              className="input"
              onChange={handleChange}
              value={formData.phone}
            />
            <input
              name="website"
              placeholder="Site web"
              className="input"
              onChange={handleChange}
              value={formData.website}
            />
          </div>

          <input
            name="address"
            required
            placeholder="Adresse complète *"
            className="input w-full"
            onChange={handleChange}
            value={formData.address}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="city"
              placeholder="Ville"
              className="input"
              onChange={handleChange}
              value={formData.city}
            />
            <input
              name="postalCode"
              placeholder="Code postal"
              className="input"
              onChange={handleChange}
              value={formData.postalCode}
            />
            <input
              name="country"
              placeholder="Pays"
              className="input"
              onChange={handleChange}
              value={formData.country}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Famille d’église
              <select
                name="tradition"
                value={formData.tradition}
                onChange={handleChange}
                className="input mt-1 w-full"
              >
                {CHURCH_TRADITIONS.map((tradition) => (
                  <option key={tradition}>{tradition}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Dénomination
              <input
                name="denomination"
                list="church-denominations-public"
                placeholder="Ex. Assemblées de Dieu"
                className="input mt-1 w-full"
                onChange={handleChange}
                value={formData.denomination}
              />
            </label>
          </div>

          <datalist id="church-denominations-public">
            {CHURCH_DENOMINATIONS.map((denomination) => (
              <option key={denomination} value={denomination} />
            ))}
          </datalist>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="languages"
              placeholder="Langues parlées (ex. Français, anglais)"
              className="input"
              onChange={handleChange}
              value={formData.languages}
            />
            <input
              name="serviceTimes"
              placeholder="Horaires des cultes"
              className="input"
              onChange={handleChange}
              value={formData.serviceTimes}
            />
          </div>

          <textarea
            name="description"
            rows={4}
            maxLength={1500}
            placeholder="Présentez brièvement votre église et sa communauté"
            className="input w-full"
            onChange={handleChange}
            value={formData.description}
          />

          <div className="flex flex-wrap gap-5 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="childrenWelcome"
                checked={formData.childrenWelcome}
                onChange={handleChange}
              />
              Accueil des enfants
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="accessibility"
                checked={formData.accessibility}
                onChange={handleChange}
              />
              Accessible aux personnes à mobilité réduite
            </label>
          </div>

          <p className="rounded-lg bg-[#fff4ed] p-3 text-sm text-[#7a4b39]">
            La fiche sera vérifiée par notre équipe avant d’être visible dans l’annuaire.
          </p>

          <Button type="submit" className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-lg">
            Envoyer ma demande
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
