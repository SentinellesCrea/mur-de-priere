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
        <div className="text-3xl font-bold tracking-wide lg:ml-20 ">
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
        <ul className="hidden lg:flex space-x-6 text-gray-800 ml-auto">
          <li><Link href="/" className="hover:text-[#a60030]">Accueil</Link></li> 
          <li>

            <Link href="/#prayers" className="hover:text-[#a60030]" onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "prayers";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Prières
            </Link>
          </li>
          <li>
            <Link href="/#testimonies" className="hover:text-[#a60030]" onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "testimonies";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Témoignages
            </Link>
          </li>
          <li>
            <Link href="/#encouragements" className="hover:text-[#a60030]" onClick={(e) => { e.preventDefault();
                  window.location.hash = "encouragements";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Encouragements
            </Link>
          </li>
          <li><Link href="/contact" className="hover:text-[#a60030]">Contact</Link></li>
        </ul>

        {/* Bouton Contact (Desktop) */}
        <Link href="/volunteers/login" className="hidden lg:block border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100 ml-4 lg:mr-10">
          Espace des bénévoles
        </Link>

        {/* Bouton du menu burger (Mobile) */}
        <button className="lg:hidden text-3xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-md p-4 absolute top-full left-0 w-full flex flex-col items-center">
          <Link href="/" className="block py-2 text-gray-800 hover:text-black" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link href="/#prayers" className="hover:text-[#a60030]" onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "prayers";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Prières
            </Link>
            <Link href="/#testimonies" className="hover:text-[#a60030]" onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "testimonies";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Témoignages
            </Link>
            <Link href="/#encouragements" className="hover:text-[#a60030]" onClick={(e) => { e.preventDefault();
                  window.location.hash = "encouragements";
                  const target = document.getElementById("PrayTabsSectionDisplay");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Encouragements
            </Link>
          <Link href="/contact" className="block py-2 text-gray-800 hover:text-black" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link href="/volunteers/login" className="block mt-2 border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Espace bénévoles
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
