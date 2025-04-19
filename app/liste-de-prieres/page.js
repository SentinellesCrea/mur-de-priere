"use client";

import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import CardContent from "../components/ui/CardContent";
import Button from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PrayerRequestDisplay = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const requestsPerPage = 12;

  useEffect(() => {
    const fetchPrayerRequests = async () => {
      try {
        const response = await fetch('/api/prayer-requests'); 
        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        const data = await response.json();
        setPrayerRequests(data);
      } catch (error) {
        console.error("Erreur lors du chargement des demandes de prière :", error);
      }
    };

    fetchPrayerRequests();
  }, []);

  const totalPages = Math.ceil(prayerRequests.length / requestsPerPage);
  const displayedRequests = prayerRequests.slice(
    currentPage * requestsPerPage,
    (currentPage + 1) * requestsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1 < totalPages ? prevPage + 1 : prevPage));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 >= 0 ? prevPage - 1 : prevPage));
  };

  const handlePrayClick = async (id) => {
    try {
      const response = await fetch("/api/prayer-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrayerRequests((prevRequests) =>
          prevRequests.map((prayer) =>
            prayer._id === id
              ? { ...prayer, nombrePriants: data.nombrePriants }
              : prayer
          )
        );
      } else {
        console.error("Erreur lors de la mise à jour du nombre de priants.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col mx-auto items-center space-y-6 p-10 w-full bg-gray-200">
        <Navbar />

        {displayedRequests.map((request, index) => {
          const formattedDate = request.datePublication
            ? new Date(request.datePublication).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Date inconnue";

          return (
            
            <Card key={request._id || index} className="w-full max-w-5xl p-6 relative shadow-lg rounded-lg bg-white">
              <CardContent>
                <div className="flex justify-between items-center">
                  {/* Nom de la personne (en haut à droite, en italique) */}
                  <h3 className="text-md text-pink-700">
                    {request.name ? request.name : "Anonyme"}
                  </h3>
                  {/* Bouton et nombre de priants */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {request.nombrePriants || 0} {request.nombrePriants > 1 ? "personnes prient" : "personne prie"} pour toi.
                    </span>
                    <Button variant="primary" onClick={() => handlePrayClick(request._id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      🙏 Je prie pour toi 
                    </Button>
                  </div>
                </div>

                {/* Demande de prière (juste en dessous du prénom) */}
                <p className="mt-3 text-gray-800">
                  {request.prayerRequest || "Non disponible"}
                </p>

                {/* Date de publication (en bas à gauche) */}
                <p className="mt-4 text-sm text-gray-500">
                  Publié le : {formattedDate}
                </p>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex space-x-4 mt-6">
          <Button variant="outline" onClick={prevPage} disabled={currentPage === 0}>
            ◀
          </Button>
          <span className="text-sm text-gray-700 font-semibold">{currentPage + 1} sur {totalPages}</span>
          <Button variant="outline" onClick={nextPage} disabled={currentPage + 1 >= totalPages}>
            ▶ 
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrayerRequestDisplay;
