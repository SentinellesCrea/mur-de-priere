"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Button from "../components/ui/button";
import { fetchApi } from "../../lib/fetchApi";
import { FiSearch, FiMapPin } from "react-icons/fi";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FindChurchHeader from "./components/FindChurchHeader";
import ChurchResults from "./components/ChurchResults";

const MapContainer = dynamic(() => import("./components/ChurchMap"), { ssr: false });

export default function FindChurchPage() {
  const [churches, setChurches] = useState([]);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState("10");
  const [userLocation, setUserLocation] = useState(null);

  const fetchChurches = async (query = "") => {
    try {
      const res = await fetchApi(`/api/churches${query}`);
      setChurches(res);
    } catch (error) {
      console.error("Erreur chargement des églises :", error.message);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <FindChurchHeader />

        <div className="max-w-7xl mx-auto pt-16 px-4 md:px-8 pb-20">
          
        <div className="mt-20">
          <Button
            variant="outline"
            className="text-brand font-semibold px-4 py-2 mb-6 rounded-xl shadow transition transform hover:-translate-y-2 duration-300"
            onClick={() => {
              if (!navigator.geolocation) {
                alert("La géolocalisation n'est pas supportée par votre navigateur.");
                return;
              }

              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  setUserLocation({ lat: latitude, lng: longitude });

                  await fetchChurches(`?lat=${latitude}&lng=${longitude}&radius=${radius}`);
                },
                (err) => {
                  console.error("Erreur géolocalisation :", err.message);
                  alert("Impossible d'obtenir votre position.");
                }
              );
            }}
          >
            <FiMapPin className="inline mr-2" />
            Ma position
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Colonne gauche */}
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Nom ou adresse"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>

              <div className="flex justify-start">
                <Button
                  className="bg-brand text-white px-5 py-2 rounded-xl font-semibold w-fit"
                  onClick={async () => {
                    await fetchChurches(`?name=${encodeURIComponent(search)}`);
                  }}
                >
                  <FiSearch className="inline mr-2" />
                  Rechercher
                </Button>
              </div>

              <div className="space-y-3">
                <ChurchResults churches={churches} />
              </div>
            </div>

            {/* Colonne droite : Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-[600px] md:-mt-20">
            <MapContainer churches={churches} centerPosition={userLocation} />
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
