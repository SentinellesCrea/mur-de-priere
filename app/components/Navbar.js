"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const scrollToSection = (hash) => {
    const target = document.getElementById("PrayTabsSectionDisplay");
    if (target) {
      const yOffset = -80; // 🔹 hauteur de ta navbar (ajuste si besoin)
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.location.hash = hash;
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 👉 NAVBAR CLASSIQUE visible seulement en haut */}
      {!scrolled && (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md font-[Poppins] z-50 transition-transform">
          <div className="flex justify-between items-center px-4 md:px-14 h-[80px]">
            {/* Logo */}
            <div className="text-3xl font-bold tracking-wide">
              <Link href="/">
                <Image
                  src="/images/Logo_mur_de_priere.png"
                  alt="Logo"
                  width={200}
                  height={80}
                  className="cursor-pointer transition transform hover:-translate-y-1 duration-300"
                />
              </Link>
            </div>

            {/* Liens desktop */}
            <ul className="hidden lg:flex space-x-6 text-gray-800 ml-auto items-center">
              <li><Link href="/" className="hover:text-[#a60030]">Accueil</Link></li>
              <li><Link href="/#prayers" className="hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("prayers"); }}>Prières</Link></li>
              <li><Link href="/#testimonies" className="hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("testimonies"); }}>Témoignages</Link></li>
              <li><Link href="/#encouragements" className="hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("encouragements"); }}>Encouragements</Link></li>
              <li><Link href="/contact" className="hover:text-[#a60030]">Contact</Link></li>
            </ul>

            <Link href="/volunteers/login" className="hidden lg:block border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100 ml-4 transition transform hover:-translate-y-1 duration-300">
              Espace bénévoles
            </Link>

            {/* Bouton menu mobile */}
            <button className="lg:hidden text-3xl" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </nav>
      )}

      {/* 👉 BOUTON MENU FLOTANT quand scroll */}
      {scrolled && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 right-4 z-50 bg-white shadow-md rounded-full p-2 text-3xl"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      )}

      {/* 👉 MENU FLOTTANT */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-14 right-4 z-40 bg-white shadow-xl rounded-md p-6 flex flex-col items-start space-y-4 w-[260px] lg:w-[300px]"
        >
          <Link href="/" className="text-gray-800 hover:text-[#a60030]" onClick={() => setIsOpen(false)}>Accueil</Link>
          <Link href="/#prayers" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("prayers"); setIsOpen(false); }}>Prières</Link>
          <Link href="/#testimonies" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("testimonies"); setIsOpen(false); }}>Témoignages</Link>
          <Link href="/#encouragements" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => { e.preventDefault(); scrollToSection("encouragements"); setIsOpen(false); }}>Encouragements</Link>
          <Link href="/contact" className="text-gray-800 hover:text-[#a60030]" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link href="/volunteers/login" className="border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100 mt-2" onClick={() => setIsOpen(false)}>Espace bénévoles</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
