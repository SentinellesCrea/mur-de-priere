"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TestimonialsPage = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [testimony, setTestimony] = useState("");
  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [testimonyText, setTestimonyText] = useState("");

  // Charger les témoignages depuis l'API
  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const response = await fetch("/api/testimonies");
        if (response.ok) {
          const data = await response.json();
          setTestimonies(data);
        } else {
          console.error("Erreur lors du chargement des témoignages");
        }
      } catch (error) {
        console.error("Erreur API :", error);
      }
    };

    fetchTestimonies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (firstName.trim() && testimony.trim()) {
      const newTestimony = {
        firstName,
        testimony,
      };

      try {
        const response = await fetch("/api/testimonies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTestimony),
        });

        if (response.ok) {
          const savedTestimony = await response.json();
          setTestimonials((prev) => [savedTestimony, ...prev]); // Mettre à jour la liste
          setFirstName("");
          setTestimony("");
          alert("Votre témoignage a été envoyé !");
        } else {
          alert("Erreur lors de l'enregistrement.");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi du témoignage :", error);
      }
    }
  };

  return (
    <div className="bg-white text-gray-900 mb-10">
      <Navbar />

      <div className="bg-blue-100 text-gray-900 mt-20 p-6 rounded-lg shadow-md max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Votre témoignage peut changer une vie !</h2>
        <p className="font-bold text-pink-600">« Ils l'ont vaincu à cause du sang de l'Agneau et à cause de la parole de leur témoignage. » Apocalypse 12:11</p>
        <p className="mt-4 text-gray-700">Chaque témoignage est une <strong>lumière</strong> qui éclaire le chemin d’un autre.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Partagez votre témoignage</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Votre prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
          <textarea
            rows="5"
            placeholder="Votre témoignage"
            value={testimony}
            onChange={(e) => setTestimony(e.target.value)}
            className="w-full p-3 border rounded-md"
          ></textarea>
          <div className="flex justify-end">
            <button type="submit" className="bg-[#E9967A] text-white p-3 rounded-lg font-semibold hover:bg-[#FA8072] transition">
              Envoyer le témoignage
            </button>
          </div>
        </form>
      </div>

   
    <div className="mb-4 mt-6 p-6 w-full max-w-5xl justify-between shadow-lg mx-auto">
      {testimonies.length > 0 ? (
      testimonies.map((testimony) => (
        <div key={testimony._id} className="mb-2 p-4 rounded-lg shadow-md bg-white">
          <h3 className="mb-2 font-semibold italic text-[#bf7b60]">-{testimony.firstName || "Anonyme"}</h3>
          <p className="text-gray-700 mb-2">{testimony.testimony}</p>
          <span className="text-sm text-gray-500">
            Publié le : {new Date(testimony.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </span>
        </div>
      ))
      ) : (
      <p>Aucun témoignage pour le moment.</p>
    )}
    </div>
      <Footer />
    </div>
  );
};

export default TestimonialsPage;
