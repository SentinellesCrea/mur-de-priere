"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSend } from "react-icons/fi";
import { RiEdit2Line } from "react-icons/ri";
import { fetchApi } from "@/lib/fetchApi";
import PrayerRequestForm from "../PrayerRequestForm";

export default function HeroSection() {

  const [prayersCount, setPrayersCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [testimoniesCount, setTestimoniesCount] = useState(0);

  const remainingCount = Math.max(prayersCount - 3, 0);

  useEffect(() => {
    const loadPrayersCount = async () => {
      try {
        const data = await fetchApi("/api/prayerRequests");
        setPrayersCount(data?.length || 0);
      } catch (error) {
        console.error("Erreur chargement nombre prières", error);
      }
    };

    loadPrayersCount();
  }, []);

  useEffect(() => {
    const loadTestimoniesCount = async () => {
      try {
        const data = await fetchApi("/api/testimonies");
        setTestimoniesCount(data?.length || 0);
      } catch (error) {
        console.error("Erreur chargement nombre témoignages", error);
      }
    };

    loadTestimoniesCount();
  }, []);


  const scrollToPrayerWall = () => {
    const target = document.getElementById("PrayerWallSection");
    if (!target) return;

    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset 

    window.scrollTo({ top: y, behavior: "smooth" });
  };


  const scrollToTestimonials = () => {
    const target = document.getElementById("TestimonialsSection");
    if (!target) return;
    
    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset 
    window.scrollTo({ top: y, behavior: "smooth" });
  };


  return (
    <section className="w-full bg-[#FAF7F4] py-8 bg-no-repeat bg-cover bg-center bg-fixed bg-[url('/images/HeroSectionBg.png')] ">
      {/* CONTAINER */}
      <div className="max-w-[1500px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT */}
          <div className="flex flex-col gap-6 mt-6">
            <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">       
              <span 
                className="text-[#d3947c]"
                style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.15)" }}
              >
                Ensemble,
              </span>
              <span 
                className ="ml-2"
                style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.15)" }}
              > 
                portons nos fardeaux dans 
              </span>

              <span 
                className="text-[#d3947c] ml-2"
                style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.15)" }}
              >
                la prière
              </span>
            </h1>

            <p
              className="text-base md:text-lg text-white leading-relaxed"
              style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.15)" }}
            >
              Mur de Prière est un espace où chaque prière compte.
              <br />
              Ici, vous pouvez partager vos fardeaux, déposer vos requêtes et unir
              votre foi à celle des autres.
              <br />
              Ensemble, levons-nous comme des Sentinelles, car aucune prière n’est
              oubliée et chaque intercession a un impact.
            </p>

            <div className="flex gap-4">
              <div className="flex -space-x-3">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBFjQ2L7kREpOfOPZN6WTGKQZ-v4VmivI_RZtM5k_T4Xn1NdcwONNepkUX_kI9511sh96LUdgMfLVJb2YhzTYcl5WFNhsawomzljf8sunQ053AN7E8PVMSEhQPKVZ9j80Vr2G0yGpcTpeObxdvzGvzgrVIHPEr7eMTffONy9Z-pVXAIUrv9vUb6bp_fyQLxoe5sBr5u0n56i_tTXrZoEdw30OAB2JvX5bj2JqbxxKAnwVIaU2lpDIpKzLjjO7Ouuw6TzF1wEx5S-Q",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDHP_48izPyRGwy5V5-RJWTQPTAz7bDRsz9XLrGQvSsZxCz_zJFpDqvKqdM-quNMonUTRGLIQJ9Qe7FVY4gDSp6yww99kFWYhmA3V9_QMSLzzT6J_ngSDtsxpcN9wcGU-o_8c02CzwdxUwvryzFean-IyzpUKBOTahNXt99L_VRRixXznME31xsN3o4YuECHlJZb2fYNgpQDzegnHZ6B_y4m9oIxQWGAYoKvXw4Vp4uwsOEsl6XWTU2Y1wG5zyZW2OWTHLlib-q_Q",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-NBZGOkTGPSuIoAjhaXXxwKhpdUBh9rDRH3aLFUUcHrgtEpzDL59Yi_HlTZqf2y2Ih6XCkAMOSe0snF1t-8eIGXu3lvUdYCEYuIvjHPxoLp2iQaRwyQosEphJ8A9-7DNt0Y5AhFbxZrE_Ynh8ZGxKCv_YmDV0UscJ2UR0HcwcOd_PdqruYn2j77ho8jOHgevR1gZgK1JXrOHaRK1tRlTijx1eTBAoKwZ1pKUlzIi8bmsHTvAkN4HJDDRWd7LkINWE32MWFmS4qg",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Avatar ${i + 1}`}
                    className="h-10 w-10 rounded-full ring-2 ring-white transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300"
                  />
                ))}

                {remainingCount > 0 && (
                  <button
                    onClick={scrollToPrayerWall}
                    className="
                      flex items-center justify-center
                      h-10 w-10
                      rounded-full
                      bg-[#d8947c]/30
                      text-[#8C5A3C]
                      text-xs font-bold
                      ring-2 ring-white
                      hover:bg-[#d8947c]
                      hover:text-white
                      transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300
                      cursor-pointer
                    "
                    aria-label="Voir toutes les demandes de prière"
                  >
                    +{remainingCount.toLocaleString("fr-FR")}
                  </button>
                )}

              </div>

              <div className="flex flex-col justify-center">
                {/* LIGNE DU HAUT */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={scrollToPrayerWall}
                    className="text-sm font-bold text-[#3F3A36]"
                  >
                    {prayersCount.toLocaleString("fr-FR")} prières
                  </button>

                  <span className="text-[#8C5A3C] font-semibold">
                    et
                  </span>

                  <button 
                    onClick={scrollToTestimonials}
                    className="text-sm font-bold text-[#3F3A36]"
                  >
                    {testimoniesCount.toLocaleString("fr-FR")} témoignages
                  </button>
                </div>

                {/* TEXTE EN DESSOUS */}
                <p className="text-xs text-[#7A6F66] mt-1">
                  ont déjà été déposées
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full">
            <PrayerRequestForm />
          </div>

        </div>
      </div>
    </section>
  );
}

