"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Button from "../components/ui/button";
import { fetchApi } from "../../lib/fetchApi";
import { FiMapPin, FiPlusCircle, FiSearch } from "react-icons/fi";
import { FaChurch } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChurchResults from "./components/ChurchResults";
import { CHURCH_DENOMINATIONS, CHURCH_TRADITIONS } from "@/data/churchOptions";

const MapContainer = dynamic(() => import("./components/ChurchMap"), { ssr: false });

export default function FindChurchPage() {
  const [churches, setChurches] = useState([]);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("");
  const [tradition, setTradition] = useState("");
  const [denomination, setDenomination] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [activeQuery, setActiveQuery] = useState("");

  const fetchChurches = async (query = "", requestedPage = 1) => {
    try {
      setLoading(true);
      setHasSearched(true);
      setSearchError("");
      const params = new URLSearchParams(query.replace(/^\?/, ""));
      params.set("page", String(requestedPage));
      params.set("limit", "12");
      const res = await fetchApi(`/api/churches?${params.toString()}`);
      const nextChurches = Array.isArray(res) ? res : res.churches || [];

      setChurches(nextChurches);
      setTotal(Array.isArray(res) ? nextChurches.length : res.total || 0);
      setCurrentPage(Array.isArray(res) ? 1 : res.page || requestedPage);
      setTotalPages(Array.isArray(res) ? 1 : res.totalPages || 1);
      setSuggestions(Array.isArray(res) ? [] : res.suggestions || []);
      setActiveQuery(query);
      if (!Array.isArray(res)) setUserLocation(res.center || null);
    } catch (error) {
      console.error("Erreur chargement des églises :", error.message);
      setChurches([]);
      setTotal(0);
      setSuggestions([]);
      setSearchError(error.message || "La recherche n’a pas pu aboutir.");
    } finally {
      setLoading(false);
    }
  };

  const buildFilters = (extra = {}) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (address.trim()) params.set("address", address.trim());
    if (tradition) params.set("tradition", tradition);
    if (denomination.trim()) params.set("denomination", denomination.trim());
    if (radius) params.set("radius", radius);
    Object.entries(extra).forEach(([key, value]) => params.set(key, String(value)));
    return `?${params.toString()}`;
  };

  const hasSearchCriterion = Boolean(
    address.trim() || denomination.trim() || search.trim() || tradition
  );

  const googleMapsUrl = (() => {
    const confession = [denomination, tradition].filter(Boolean).join(" ");
    const location = address.trim() || "ma position";
    const query = [
      "église",
      confession,
      `près de ${location}`,
      radius ? `rayon ${radius} km` : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (userLocation && !address.trim()) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation.lat},${userLocation.lng},12z`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  })();

  return (
    <div>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />

        <main>
          <section
            className="bg-[#253047] px-4 py-6 text-white sm:py-8"
            aria-labelledby="find-church-title"
          >
            <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-4 md:flex-row md:items-center md:gap-8">
              <div className="max-w-3xl">
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#efb8a3]">
                  <FaChurch aria-hidden="true" />
                  Annuaire des communautés chrétiennes
                </p>
                <h1
                  id="find-church-title"
                  className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                >
                  Trouver une église près de chez vous
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                  Recherchez une communauté par ville, famille ou dénomination
                  pour prier et avancer avec d’autres chrétiens.
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm md:block">
                <p className="text-xs font-semibold text-white/75 md:text-sm">
                  Vous représentez une communauté ?
                </p>
                <Link
                  href="/ajouter-eglise"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#d8947c] px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a] md:mt-2 md:w-full"
                >
                  <FiPlusCircle aria-hidden="true" />
                  <span className="hidden sm:inline">Inscrire mon église</span>
                  <span className="sm:hidden">Inscrire</span>
                </Link>
              </div>
            </div>
          </section>

        <div className="mx-auto max-w-[1500px] px-4 pb-20 pt-6 md:px-8">
        <div>
          <Button
            variant="outline"
            className="text-brand font-semibold px-4 py-2 mb-6 rounded-xl shadow transition transform hover:-translate-y-2 duration-300"
            disabled={loading}
            onClick={() => {
              if (!navigator.geolocation) {
                alert("La géolocalisation n'est pas supportée par votre navigateur.");
                return;
              }

              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  setUserLocation({ lat: latitude, lng: longitude });

                  await fetchChurches(buildFilters({ lat: latitude, lng: longitude }));
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

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            {/* Colonne gauche */}
            <form
              className="flex flex-col space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (hasSearchCriterion) fetchChurches(buildFilters());
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Où cherchez-vous ?
                </label>
                <input
                  type="text"
                  placeholder="Adresse, ville ou code postal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  Rayon (facultatif)
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Aucun rayon précis</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="50">50 km</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Famille (facultatif)
                  <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Toutes les familles</option>
                    {CHURCH_TRADITIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  Dénomination
                  <input
                    list="find-church-denominations"
                    value={denomination}
                    onChange={(e) => setDenomination(e.target.value)}
                    placeholder="Ex. Assemblées de Dieu"
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Nom de l’église (optionnel)
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ex. Église Source de Vie"
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              </div>
              <datalist id="find-church-denominations">
                {CHURCH_DENOMINATIONS.map((item) => <option key={item} value={item} />)}
              </datalist>

              <div className="flex justify-start">
                <Button
                  type="submit"
                  className="bg-brand text-white px-5 py-2 rounded-xl font-semibold w-fit"
                  disabled={loading || !hasSearchCriterion}
                >
                  <FiSearch className="inline mr-2" />
                  {loading ? "Recherche…" : "Rechercher"}
                </Button>
              </div>

              {!hasSearchCriterion && (
                <p className="text-sm text-gray-500">
                  Indiquez au moins une ville, une dénomination, une famille ou
                  le nom d’une église. Le rayon reste facultatif.
                </p>
              )}
            </form>

            {/* Colonne droite : Map */}
            <div className="h-[520px] overflow-hidden rounded-2xl shadow-lg">
              <MapContainer
                churches={churches.length > 0 ? churches : suggestions}
                centerPosition={userLocation}
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {searchError && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {searchError}
              </p>
            )}

            {hasSearched ? (
              <ChurchResults
                churches={churches}
                centerPosition={userLocation}
                total={total}
                currentPage={currentPage}
                pageCount={totalPages}
                loading={loading}
                onPageChange={(page) => fetchChurches(activeQuery, page)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                Choisissez vos critères puis lancez la recherche pour afficher les églises.
              </div>
            )}

            {hasSearched && suggestions.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-bold text-amber-950">
                  Ces communautés ne correspondent pas exactement à votre zone
                </h3>
                <p className="mt-2 text-sm text-amber-900/80">
                  Elles sont toutefois situées à proximité et pourraient vous intéresser.
                </p>
                <div className="mt-4">
                  <ChurchResults
                    churches={suggestions}
                    centerPosition={userLocation}
                    total={suggestions.length}
                    title="Églises proposées à proximité"
                  />
                </div>
              </div>
            )}

            {hasSearched && (
              <div className="rounded-2xl border border-[#ead8ca] bg-[#fff8f2] p-5">
                <h3 className="font-bold text-gray-900">
                  {churches.length === 0
                    ? "Aucune communauté référencée dans cette zone"
                    : "Tu souhaites élargir la recherche ?"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Consulte aussi les églises déjà présentes sur Google Maps avec les mêmes critères.
                </p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#8B1E3F] shadow-sm ring-1 ring-[#e4cbbb] transition hover:-translate-y-0.5"
                >
                  <FiMapPin />
                  Continuer sur Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
