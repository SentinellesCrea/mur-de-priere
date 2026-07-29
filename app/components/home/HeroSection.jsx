"use client";

import { useEffect, useState } from "react";
import { FaPrayingHands } from "react-icons/fa";
import { FiArrowDown, FiShield } from "react-icons/fi";
import { fetchApi } from "@/lib/fetchApi";
import PrayerRequestForm from "../PrayerRequestForm";

export default function HeroSection({ onNewPrayer }) {
  
  const [prayersCount, setPrayersCount] = useState(0);
  const [testimoniesCount, setTestimoniesCount] = useState(0);
  const [countsLoaded, setCountsLoaded] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [prayers, testimonies] = await Promise.all([
          fetchApi("/api/prayerRequests/count"),
          fetchApi("/api/testimonies/count"),
        ]);

        setPrayersCount(prayers?.count || 0);
        setTestimoniesCount(testimonies?.count || 0);
        setCountsLoaded(true);
      } catch (error) {
        console.error("Erreur chargement counts", error);
      }
    };

    loadCounts();
  }, []);

  const scrollToPrayerWall = () => {
    const target = document.getElementById("PrayerWallSection");
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const scrollToTestimonials = () => {
    const target = document.getElementById("TestimonialsSection");
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const scrollToPrayerForm = () => {
    const target = document.getElementById("PrayerRequestForm");
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      className="w-full bg-[#FAF7F4] py-8 bg-no-repeat bg-cover bg-center bg-fixed bg-[url('/images/HeroSectionBg.png')]"
      aria-labelledby="home-heading"
    >
      <div className="max-w-[1500px] mx-auto px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">

          {/* LEFT */}
          <div className="mt-6 flex flex-col gap-6 lg:sticky lg:top-28 lg:pt-10">
            <h1
              id="home-heading"
              className="text-4xl lg:text-6xl font-black leading-tight tracking-tight"
            >
              <span
                className="text-[#d3947c]"
                style={{ textShadow: "2px 1px 2px rgba(0,0,0,0.40)" }}
              >
                Ensemble,{" "}
              </span>
              <span
                style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.15)" }}
              >
                portons nos fardeaux dans{" "}
              </span>
              <span
                className="text-[#d3947c]"
                style={{ textShadow: "2px 1px 2px rgba(0,0,0,0.40)" }}
              >
                la prière
              </span>
            </h1>

            <p
              className="rounded-xl bg-white/65 p-4 text-base leading-relaxed text-gray-800 backdrop-blur-[2px] md:text-lg"
              style={{ textShadow: "0 1px 1px rgba(255,255,255,0.65)" }}
            >
              Mur de Prière est un espace où chaque prière compte.
              <br />
              Ici, vous pouvez partager vos fardeaux, déposer vos requêtes et unir
              votre foi à celle des autres.
              <br />
              Ensemble, levons-nous comme des Sentinelles, car aucune prière n’est
              oubliée et chaque intercession a un impact.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToPrayerForm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d3947c] px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#c77a5b]"
              >
                Déposer une demande
                <FiArrowDown aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollToPrayerWall}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white/90 px-6 py-3 font-bold text-gray-900 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <FaPrayingHands aria-hidden="true" />
                Prier pour quelqu’un
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="mt-0.5 rounded-full bg-[#d8947c]/15 p-2 text-[#9f624c]">
                <FiShield aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-900">
                  Gratuit · prénom privilégié · anonymat possible · coordonnées jamais publiées
                </p>

                <div className="flex items-center gap-2 flex-wrap">

                  {countsLoaded ? (
                    <button
                      onClick={scrollToPrayerWall}
                      className="text-sm font-bold text-[#3F3A36] hover:text-[#d8947c] transition"
                    >
                      {prayersCount.toLocaleString("fr-FR")} prières
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-[#3F3A36] opacity-40 animate-pulse">
                      Chargement…
                    </span>
                  )}

                  <span className="text-[#8C5A3C] font-semibold">et</span>

                  {countsLoaded ? (
                    <button
                      onClick={scrollToTestimonials}
                      className="text-sm font-bold text-[#3F3A36] hover:text-[#d8947c] transition"
                    >
                      {testimoniesCount.toLocaleString("fr-FR")} témoignages
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-[#3F3A36] opacity-40 animate-pulse">
                      …
                    </span>
                  )}
                </div>

                <p 
                  className="text-xs text-[#7A6F66] mt-1"
                >
                  ont déjà été déposés sur le Mur de Prière
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full">
            <PrayerRequestForm onNewPrayer={onNewPrayer} />
          </div>

        </div>
      </div>
    </section>
  );
}
