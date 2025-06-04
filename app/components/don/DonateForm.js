"use client";

import { useState } from "react";

export default function DonateForm() {
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
    <div className="w-full md:w-1/2 bg-white shadow-lg p-8 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">Faire un don maintenant</h2>
      <p className="text-gray-700 mb-4">
        Sélectionnez un montant ou saisissez un montant libre.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        {[5, 10, 20, 50].map((val) => (
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
    </div>
  );
}
