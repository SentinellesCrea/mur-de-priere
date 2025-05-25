"use client";

import { useState } from "react";
import { toast } from 'react-toastify';

const PrayerRequestForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prayerRequest, setPrayerRequest] = useState("");
  const [notify, setNotify] = useState(false);
  const [wantsVolunteer, setWantsVolunteer] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [shareOption, setShareOption] = useState("Partager cette demande");
  const [date, setDate] = useState(new Date().toISOString());
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const subcategories = {
    Famille: ["Unité familiale", "Conflits", "Relations familiales", "Éducation des enfants","Protection"],
    Santé:["Guérison physique","Problème mentaux","Accompagnement pendant la maladie"],
    Relations: ["Amitié", "Conflits", "Manque de Pardon"],
    Mariage: ["Restauration", "Trouver un partenaire", "Crise conjugale", "Bien vivre son célibat"],
    Ministère: ["Appel", "Discernement", "Persévérance"],
    Travail: ["Recherche d'emploi", "Finances", "Projet professionnel"],
    Finances: ["Difficultés financières", "Endettement", ""],
    Autres: []
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !prayerRequest || !category) return;

  const requestData = {
    name,
    email: wantsVolunteer || notify ? email : "",
    phone: wantsVolunteer ? phone : "",
    prayerRequest,
    isUrgent,
    notify,
    wantsVolunteer,
    shareOption,
    date,
    category,
    subcategory
  };

  try {
    const response = await fetch("/api/prayerRequests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const data = await response.json(); // Récupérer la réponse JSON de l'API

    if (response.ok) {
      toast.success("Demande envoyée !");
      setName("");
      setEmail("");
      setPhone("");
      setPrayerRequest("");
      setNotify(false);
      setWantsVolunteer(false);
      setIsUrgent(false);
      setDate(new Date().toISOString());
      setCategory("");
      setSubcategory("");
    } else {
      // Si la réponse n'est pas OK, on affiche le message d'erreur renvoyé par l'API
      toast.error(data.message || "Erreur lors de l'envoi.");
    }
  } catch (error) {
    // Si l'API ou la requête échoue, on affiche un message générique
    toast.error("Erreur lors de l'envoi :", error.message || "Erreur inconnue.");
  }
};


  return (
    <section 
      id="PrayerRequestForm" 
      className="flex flex-col md:flex-row items-center justify-center bg-[#e1d8cb] px-8 py-10 mx-auto w-full min-h-screen "
    >
      <div className="w-full max-w-3xl p-6 shadow-lg bg-white rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">          
          Partagez vos sujets de prière, quelqu'un priera pour vous. <br />
          Soutenez également les autres dans la prière.
        </h1>

        <p className="text-gray-600 text-sm mb-4">
          Vous pouvez soumettre votre demande de prière ici. Elle sera partagée selon vos préférences.<br/>
          Si vous souhaitez que quelqu'un prie avec vous, cochez la case "Je souhaite être recontacté par un bénévole".<br/>
          Saisissez ensuite votre adresse e-mail et votre numéro de téléphone, <b>un bénévole vous recontactera.</b>
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Votre prénom -  mettez 'Anonyme' sinon"
            className="w-full p-3 border rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="w-full p-3 border rounded-md"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            required
          >
            <option value="">-- Sélectionnez une catégorie --</option>
            {Object.keys(subcategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {category && category !== "Autres" && subcategories[category] && (
            <select
              className="w-full p-3 border rounded-md"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              <option value="">-- Sous-catégorie (optionnel) --</option>
              {subcategories[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          {category === "Autres" && (
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              placeholder="Décrivez la sous-catégorie"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          )}

          <textarea
            rows="5"
            placeholder="Votre demande de prière"
            className="w-full p-3 border rounded-md"
            value={prayerRequest}
            onChange={(e) => setPrayerRequest(e.target.value)}
            required
          ></textarea>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyCheckbox"
              checked={notify}
              onChange={() => setNotify(!notify)}
              className="mr-2"
            />
            <label htmlFor="notifyCheckbox" className="text-gray-700">
              Me notifier quand quelqu'un prie pour moi
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="volunteerCheckbox"
              checked={wantsVolunteer}
              onChange={() => setWantsVolunteer(!wantsVolunteer)}
              className="mr-2"
            />
            <label htmlFor="volunteerCheckbox" className="text-gray-700">
              Je souhaite être recontacté par un bénévole
            </label>
          </div>

          {(notify || wantsVolunteer) && (
            <input
              type="email"
              placeholder="Votre email"
              className="w-full p-3 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {wantsVolunteer && (
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Votre téléphone (optionnel)"
                className="w-full p-3 border rounded-md"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="flex items-center">
                <button
                  type="button"
                  className={`p-3 font-semibold transition ${
                    isUrgent ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 rounded-md"
                  }`}
                  onClick={() => setIsUrgent(!isUrgent)}
                >
                  {isUrgent ? "🚨 Demande marquée comme urgente" : "Click ici si la demande est urgente !"}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#d3947c] text-white p-3 font-semibold hover:bg-[#c77a5b] rounded-md transition transform hover:-translate-y-2 duration-300"
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PrayerRequestForm;
