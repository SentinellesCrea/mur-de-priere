"use client";

import { useState } from "react";
import { toast } from 'react-toastify';
import { TiInfoLarge } from "react-icons/ti";
import { fetchApi } from "@/lib/fetchApi";


const PrayerRequestForm = () => {
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
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
  Famille: [
    "Unité familiale",
    "Conflits",
    "Relations familiales",
    "Éducation des enfants",
    "Protection",
    "Relations parent-enfant",
    "Famille recomposée",
    "Famille brisée",
    "Relations avec les beaux-parents"
  ],
  Santé: [
    "Guérison physique",
    "Problèmes mentaux",
    "Accompagnement pendant la maladie",
    "Maladies chroniques",
    "Addictions",
    "Fatigue ou burn-out",
    "Santé d’un proche"
  ],
  Relations: [
    "Amitié",
    "Conflits",
    "Manque de pardon",
    "Trahison",
    "Solitude",
    "Réconciliation",
    "Relations toxiques"
  ],
  Mariage: [
    "Restauration",
    "Trouver un partenaire",
    "Crise conjugale",
    "Bien vivre son célibat",
    "Infidélité",
    "Communication dans le couple",
    "Mariage à venir"
  ],
  Ministère: [
    "Appel",
    "Discernement",
    "Persévérance",
    "Protection spirituelle",
    "Épreuves dans le ministère",
    "Évangélisation",
    "Unité dans l'équipe"
  ],
  Travail: [
    "Recherche d'emploi",
    "Finances",
    "Projet professionnel",
    "Problèmes avec collègues",
    "Reconnaissance au travail",
    "Burn-out au travail",
    "Orientation professionnelle"
  ],
  Finances: [
    "Difficultés financières",
    "Endettement",
    "Gestion du budget",
    "Projets bloqués par manque d'argent",
    "Bénédictions financières",
    "Soutien pour une cause"
  ],
  Émotions: [
    "Dépression",
    "Anxiété",
    "Colère",
    "Manque d’estime de soi",
    "Pardon envers soi-même",
    "Stress chronique"
  ],
  Foi: [
    "Croissance spirituelle",
    "Lecture de la Bible",
    "Temps de prière",
    "Doutes dans la foi",
    "Foi dans l'épreuve",
    "Retour à Dieu"
  ],
  Autres: [ ]
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("🧪 handleSubmit déclenché");

  if ((!name && !isAnonymous) || !prayerRequest || !category) return;

  const requestData = {
    name: isAnonymous ? "Anonyme" : name,
    email: wantsVolunteer || notify ? email : "",
    phone: wantsVolunteer ? phone : "",
    prayerRequest,
    isUrgent,
    notify,
    wantsVolunteer,
    shareOption,
    date,
    category,
    subcategory,
  };

  try {
    const response = await fetch("/api/prayerRequests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(requestData),
});

const data = await response.json();
console.log("👉 Reçu :", data);

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
    setIsAnonymous(false);
  } catch (error) {
    toast.error(error.message || "Erreur lors de l'envoi.");
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

          {/* 🔹 Prénom, facultatif si anonyme */}
          <input
            type="text"
            placeholder="Votre prénom"
            className="w-full p-3 border rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isAnonymous}
            disabled={isAnonymous}
          />

          {/* ✅ Case Anonyme */}
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="anonymousCheckbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="mr-2"
            />
            <label htmlFor="anonymousCheckbox" className="text-gray-700">
              Je souhaite rester anonyme
            </label>
          </div>

          {/* Le reste inchangé */}
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

          {category && category !== "Autres" && (
            <>
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
            </>
          )}
          <span className=" flex text-sm text-red-500 mt-1 block">
            <TiInfoLarge size={20} />
            Le choix d‘une catégorie est confidentiel et ne sera pas visible publiquement.
          </span>

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

          {/* Autres options inchangées */}
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
                  {isUrgent ? "🚨 Demande marquée comme urgente" : "Cliquez ici si la demande est urgente !"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-[#d3947c] text-white p-3 font-semibold hover:bg-[#c77a5b] rounded-md transition transform hover:-translate-y-2 duration-300"
          >
            Envoyer la demande
          </button>
        </form>
      </div>
    </section>
  );
};

export default PrayerRequestForm;