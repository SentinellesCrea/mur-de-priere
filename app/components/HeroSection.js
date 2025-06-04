"use client";

import Link from "next/link";
import Button from "./ui/button";

const HeroSection = () => {
  return (
    <section
      className="h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-end px-8 sm:px-16 bg-[url('/images/HeroSection-bg.jpeg')] bg-hero-mobile"
    >

      <div className="max-w-2xl ml-auto text-white text-center lg:text-left px-6 lg:px-0 lg:mr-20">
        <h1 className="mt-8 md:mt-0 text-5xl md:text-7xl font-extrabold" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
        Bienvenue sur le Mur de Prière</h1>
        <p className="text-base text-lg md:text-xl mt-4" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
          Mur de Prière est un espace où chaque prière compte. <br />
          Ici, vous pouvez partager vos fardeaux, déposer vos requêtes et unir votre foi à celle des autres. 
          Que vous traversiez une épreuve ou que vous souhaitiez simplement soutenir quelqu’un dans la prière, vous êtes au bon endroit. 
          Ensemble, levons nous comme des Sentinelles, car aucune prière n’est oubliée et chaque intercession a un impact.<br />
          Déposez votre sujet de prière, ou priez pour d’autres croyants à travers le monde. Ensemble, dans la foi.
        </p>
        <Button
            onClick={() =>
              document.getElementById('PrayerRequestForm')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="mt-6 text-lg font-semibold transform hover:-translate-y-2 duration-300"
          >
            Déposer un sujet de prière
          </Button>
      </div>
    </section>
  );
};

export default HeroSection;
