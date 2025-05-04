"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Icônes pour le menu burger

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // État du menu
  const prayerListRef = useRef(null);

  const scrollToSectionPray = (event) => {
    event.preventDefault(); // Empêche le lien de recharger la page

    const target = document.getElementById("PrayTabsSectionDisplay");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md font-[Poppins] z-50">
      <div className="flex justify-between items-center px-14">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-wide">
          <Link href="/">
              <Image
                src="/images/Logo_mur_de_priere.png" // Remplace avec le chemin de ton logo
                alt="Logo"
                width={200} // Largeur de l'image en pixels
                height={80} // Hauteur de l'image en pixels
                className="cursor-pointer" // Ajoute un curseur au survol
              />
            </Link>
        </div>

        {/* Menu pour desktop */}
        <ul className="hidden md:flex space-x-6 text-gray-800 ml-auto">
          <li><Link href="/" className="hover:text-[#a60030]">Accueil</Link></li> 
          <li>
            <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">
            Prières</Link>
          </li>

          <li>
            <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">              
            Témoignages
            </Link>
          </li>
          <li>
            <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">              
            Encouragements
            </Link>
          </li>
        </ul>


        {/* Bouton du menu burger (Mobile) */}
        <button className="md:hidden text-3xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md p-4 absolute top-full left-0 w-full flex flex-col items-center">
          <Link href="/" className="hover:text-[#a60030]">Accueil</Link>
          <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">
            Prières
          </Link>
          <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">              
            Témoignages
          </Link>
          <Link href="/#PrayTabsSectionDisplay" className="hover:text-[#a60030]">              
            Encouragements
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
