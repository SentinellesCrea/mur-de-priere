"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const scrollToSection = (hash) => {
    const target = document.getElementById("PrayTabsSectionDisplay");
    if (target) {
      window.location.hash = hash;
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🔥 Gestion fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md font-[Poppins] z-50">
      <div className="flex justify-between items-center px-4 md:px-14 h-[80px]">
        {/* Logo */}
        <div className="text-3xl font-bold tracking-wide">
          <Link href="/">
            <Image
              src="/images/Logo_mur_de_priere.png"
              alt="Logo"
              width={200}
              height={80}
              className="cursor-pointer"
            />
          </Link>
        </div>

        {/* Menu Desktop */}
        <ul className="hidden lg:flex space-x-6 text-gray-800 ml-auto items-center">
          <li><Link href="/" className="hover:text-[#a60030]">Accueil</Link></li>
          <li>
            <Link href="/#prayers" className="hover:text-[#a60030]" onClick={(e) => {
              e.preventDefault();
              scrollToSection("prayers");
            }}>Prières</Link>
          </li>
          <li>
            <Link href="/#testimonies" className="hover:text-[#a60030]" onClick={(e) => {
              e.preventDefault();
              scrollToSection("testimonies");
            }}>Témoignages</Link>
          </li>
          <li>
            <Link href="/#encouragements" className="hover:text-[#a60030]" onClick={(e) => {
              e.preventDefault();
              scrollToSection("encouragements");
            }}>Encouragements</Link>
          </li>
          <li><Link href="/contact" className="hover:text-[#a60030]">Contact</Link></li>
          {/* <li><Link href="/don" className="hover:underline">Faire un don ❤️</Link></li> */}

        </ul>

        {/* Espace bénévoles Desktop */}
        <Link href="/volunteers/login" className="hidden lg:block border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100 ml-4">
          Espace bénévoles
        </Link>

        {/* Menu Burger Mobile */}
        <button className="lg:hidden text-3xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div ref={menuRef} className="lg:hidden bg-white shadow-md py-4 flex flex-col items-center space-y-4 z-40 ">
          <Link href="/" className="text-gray-800 hover:text-[#a60030]" onClick={() => setIsOpen(false)}>
            Accueil
          </Link>
          <Link href="/#prayers" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => {
            e.preventDefault();
            scrollToSection("prayers");
            setIsOpen(false);
          }}>
            Prières
          </Link>
          <Link href="/#testimonies" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => {
            e.preventDefault();
            scrollToSection("testimonies");
            setIsOpen(false);
          }}>
            Témoignages
          </Link>
          <Link href="/#encouragements" className="text-gray-800 hover:text-[#a60030]" onClick={(e) => {
            e.preventDefault();
            scrollToSection("encouragements");
            setIsOpen(false);
          }}>
            Encouragements
          </Link>
          <Link href="/contact" className="text-gray-800 hover:text-[#a60030]" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          <Link href="/volunteers/login" className="border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            Espace bénévoles
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
