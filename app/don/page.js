"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const DonatePage = () => {
  const [amount, setAmount] = useState(10);
  const [selected, setSelected] = useState(10);
  const [customAmount, setCustomAmount] = useState("");

  const handlePresetClick = (value) => {
    setSelected(value);
    if (value !== "custom") {
      setAmount(value);
      setCustomAmount("");
    }
  };

  const handleDonate = async () => {
    const finalAmount = selected === "custom" ? Number(customAmount) : amount;

    if (!finalAmount || finalAmount < 1) {
      return alert("Merci d’indiquer un montant valide.");
    }

    const res = await fetch("/api/donate/checkout-session", {
      method: "POST",
      body: JSON.stringify({ amount: finalAmount }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col mt-10">
      <Navbar />
      <main className="flex flex-col md:flex-row justify-center items-center gap-12 px-6 py-16 max-w-7xl mx-auto w-full">
        {/* Formulaire avec animation */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:w-1/2 bg-white shadow-lg p-8 rounded-lg"
        >
          <h1 className="text-3xl font-bold mb-6">Soutenir Mur de Prière</h1>
          <p className="text-1xl mb-4">Selectionnez un montant selon vos moyens, sinon vous pouvez le saisir en choisissant 
            <a className="text-1xl font-bold"> Autre.</a>
          </p> 

          <div className="flex flex-wrap gap-4 mb-6">
            {[5, 10, 20].map((val) => (
              <button
                key={val}
                onClick={() => handlePresetClick(val)}
                className={`px-4 py-2 rounded font-semibold border ${
                  selected === val
                    ? "bg-[#d8947c] text-white border-[#d8947c]"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {val} €
              </button>
            ))}
            <button
              onClick={() => handlePresetClick("custom")}
              className={`px-4 py-2 rounded font-semibold border ${
                selected === "custom"
                  ? "bg-[#d8947c] text-white border-[#d8947c]"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Autre
            </button>
          </div>

          {selected === "custom" && (
            <div className="mb-6">
              <label className="block mb-2 text-gray-700 font-medium">Montant personnalisé (€)</label>
              <input
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
            </div>
          )}

          <button
            onClick={handleDonate}
            className="w-full bg-[#d8947c] hover:bg-[#c27b67] text-white font-bold py-3 rounded transition"
          >
            Je fais un don
          </button>
        </motion.div>

        {/* Texte explicatif */}
        <div className="w-full md:w-1/2 text-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Pourquoi donner ?</h2>
          <p className="mb-4">
            Chaque don contribue à faire vivre ce projet : hébergement du site, développement continu,
            création de contenus inspirants, accompagnement spirituel personnalisé... Grâce à vous,
            nous pouvons toucher encore plus de vies à travers la prière.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">Notre vision</h3>
          <p className="mb-4">
            Faire du Mur de Prière un lieu où chacun peut venir confier son fardeau, être soutenu et
            voir Dieu agir concrètement. Nous croyons en la puissance de la prière, en l’amour fraternel,
            et en une foi vivante.
          </p>
          <p className="italic text-gray-600">
            Merci du fond du cœur à tous ceux qui soutiennent cette œuvre. Par votre générosité, vous
            permettez à ce mur spirituel de se construire et de bénir des centaines de personnes.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonatePage;
