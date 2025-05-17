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
  const requestsPerPage = 10;

  useEffect(() => {
    const fetchPrayerRequests = async () => {
      try {
        const response = await fetch('/api/prayerRequests'); 
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
      const response = await fetch("/api/prayerRequests", {
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
      <div className="flex flex-col mx-auto items-center space-y-6 p-10 w-full bg-white mt-10">
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
                  <div className="flex-1 p-2">
                        <div className="relative flex flex-col">
                          <div className="text-left mb-2 text-[#bf7b60] font-semibold italic text-sm md:text-base">
                            - {request.name || "Anonyme"}
                            <span className="text-sm text-gray-600 absolute top-2 right-2">
                              {request.nombrePriants || 0}{" "}
                              {request.nombrePriants > 1 ? "personnes prient" : "personne prie"} pour toi.
                            </span>
                          </div>

                          <p className="mt-2 text-gray-800">
                            {request.prayerRequest || "Non disponible"}
                          </p>

                          <p className="mt-4 text-xs sm:text-sm md:text-base text-gray-500">
                            Publié le :{" "}
                            {new Date(request.datePublication).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }) || "Date inconnue"}
                          </p>
                        </div>

                        <div className="relative pt-2 flex justify-between">
                          <Button
                            onClick={() => handlePrayClick(request._id)}
                            className="absolute bottom-1 right-2 
                              px-2 py-1 text-xs 
                              sm:px-3 sm:py-1.5 sm:text-sm 
                              md:px-4 md:py-2 md:text-base 
                              bg-[#d4967d] text-white rounded-lg hover:bg-[#c47f64] transition"
                          >
                            🙏 Je prie pour toi
                          </Button>
                        </div>
                      </div>
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
