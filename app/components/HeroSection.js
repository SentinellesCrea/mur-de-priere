"use client";

import Link from "next/link";

const HeroSection = () => {
  return (
    <section
      className="h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-end px-8 sm:px-16 bg-[url('/images/HeroSection-bg.jpeg')] bg-hero-mobile"
    >

      <div className="max-w-2xl ml-auto text-white text-center lg:text-left px-6 lg:px-0 lg:mr-20">
        <h1 className="text-4xl md:text-7xl font-extrabold" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
        Mur de prière</h1>
        <p className="text-base md:text-lg mt-4" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
          Bienvenue sur le Mur de Prière, un espace où chaque prière compte. <br />
          Ici, vous pouvez partager vos fardeaux, déposer vos requêtes et unir votre foi à celle des autres. 
          Que vous traversiez une épreuve ou que vous souhaitiez simplement soutenir quelqu’un dans la prière, vous êtes au bon endroit. 
          Ensemble, levons nous comme des Sentinelles, car aucune prière n’est oubliée et chaque intercession a un impact.
        </p>
        <button
          onClick={() => document.getElementById('PrayerRequestForm').scrollIntoView({ behavior: 'smooth' })}
          className="mt-6 bg-[#c77a5b] text-white text-lg font-semibold px-6 py-3 rounded-md hover:bg-[#d3947c] transition"
        >
          Déposer un sujet de prière
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
