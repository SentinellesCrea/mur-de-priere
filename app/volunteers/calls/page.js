"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import { FiMail, FiPhoneCall, FiVideo } from "react-icons/fi";
import VolunteerNavbar from "../../components/volunteers/VolunteerNavbar";

export default function CallsPage() {
  const [prayer, setPrayer] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedPrayer = localStorage.getItem("selectedPrayer");
    if (storedPrayer) {
      setPrayer(JSON.parse(storedPrayer));
    } else {
      // Si aucune prière stockée ➔ retour au dashboard
      router.push("/volunteers/dashboard");
    }
  }, []);

  if (!prayer) {
    return <div className="p-6 text-center text-gray-600">Chargement de la demande de prière...</div>;
  }

  const sendEmail = () => {
    const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${prayer.email}&su=Réponse à votre demande de prière`;
    window.open(emailUrl, "_blank");
  };

  const sendWhatsApp = () => {
    const phone = prayer.phone.replace(/\s+/g, "");
    const whatsappUrl = `https://wa.me/${phone}?text=Bonjour ${prayer.name}, suite à votre demande de prière...`;
    window.open(whatsappUrl, "_blank");
  };

  const sendZoomInvite = () => {
    const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${prayer.email}&su=Invitation Zoom pour prière`;
    window.open(emailUrl, "_blank");
  };

  return (
  <div className="w-full mt-20">
      <VolunteerNavbar />
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Fiche prière à gauche */}
      <div className="bg-white rounded shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">🙏 Demande de prière</h2>

        <p><strong>Nom :</strong> {prayer.name}</p>
        <p><strong>Email :</strong> {prayer.email || "Non fourni"}</p>
        <p><strong>Téléphone :</strong> {prayer.phone || "Non fourni"}</p>
        <p><strong>Catégorie :</strong> {prayer.category}</p>
        {prayer.subcategory && (
          <p><strong>Sous-catégorie :</strong> {prayer.subcategory}</p>
        )}
        {prayer.isUrgent && (
          <p className="text-red-600 font-bold">🚨 Urgence</p>
        )}
        <p className="text-gray-600 text-sm italic">
          Reçue le : {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded text-gray-700">
          <p className="whitespace-pre-line">{prayer.prayerRequest}</p>
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex flex-col gap-6 bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">📞 Contactez {prayer.name}</h2>

        {prayer.email && (
          <button
            onClick={sendEmail}
            className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FiMail /> Envoyer un Email
          </button>
        )}

        {prayer.phone && (
          <button
            onClick={sendWhatsApp}
            className="bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FiPhoneCall /> Envoyer un message WhatsApp
          </button>
        )}

        {prayer.email && (
          <button
            onClick={sendZoomInvite}
            className="bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 flex items-center gap-2"
          >
            <FiVideo /> Envoyer une invitation Zoom
          </button>
        )}
      </div>
    </div>
  </div>
  );
}
