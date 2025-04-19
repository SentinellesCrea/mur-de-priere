"use client";

import { useState } from "react";

const PrayerRequestToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <button
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Fermer le formulaire" : "Partager une demande de prière"}
      </button>
      {isOpen && <PrayerRequestForm />}
    </div>
  );
};

const PrayerRequestForm = () => {
  const [notify, setNotify] = useState(false);

  return (
    <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
      <p className="text-gray-600 text-sm mb-4">
        Vous pouvez soumettre votre demande de prière ici. Elle sera partagée
        selon vos préférences.
      </p>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Votre nom"
          className="w-full p-3 border rounded-md"
        />
        <input
          type="email"
          placeholder="Votre email"
          className="w-full p-3 border rounded-md"
        />
        <input
          type="text"
          placeholder="Votre téléphone"
          className="w-full p-3 border rounded-md"
        />
        <select className="w-full p-3 border rounded-md">
          <option>Partager cette demande</option>
          <option>Partager anonymement</option>
          <option>Ne pas partager</option>
        </select>
        <textarea
          rows="5"
          placeholder="Votre demande de prière"
          className="w-full p-3 border rounded-md"
        ></textarea>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notify"
            checked={notify}
            onChange={() => setNotify(!notify)}
            className="mr-2"
          />
          <label htmlFor="notify" className="text-gray-700">
            Me notifier quand quelqu'un prie pour moi
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Envoyer la demande
        </button>
      </form>
    </div>
  );
};

export default PrayerRequestToggle;
