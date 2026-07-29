"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";

const NAV_OFFSET = 20;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  /* ================= SCROLL HANDLER ================= */
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsOpen(false);

    // ✅ Déjà sur la home → scroll direct
    if (pathname === "/") {
      const target = document.getElementById(sectionId);
      if (!target) return;

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        NAV_OFFSET;

      window.history.pushState(null, "", `#${sectionId}`);
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // ❌ Autre page → retour home + hash
    else {
      router.push(`/#${sectionId}`);
    }
  };

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SCROLL LISTENER ================= */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= HASH SCROLL ON LOAD ================= */
  useEffect(() => {
    if (!window.location.hash) return;

    const id = window.location.hash.replace("#", "");

    const timer = setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        NAV_OFFSET;

      window.scrollTo({ top: y, behavior: "smooth" });
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* ================= NAVBAR TOP ================= */}
        <header
          className={`fixed top-0 left-0 w-full z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
        >
          <div className="flex items-center justify-between px-4 md:px-14 h-[80px] mx-auto">

            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/mur-de-priere-navbar.png"
                alt="Logo Mur de Prière"
                width={240}
                height={58}
                className="h-12 w-auto cursor-pointer object-contain transition-transform duration-300 hover:-translate-y-1 md:h-14"
                priority
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
            <ul className="flex items-center space-x-6 text-gray-800">
              <li>
                <Link
                  href="/#PrayerWallSection"
                  onClick={(e) => handleScrollToSection(e, "PrayerWallSection")}
                  className="hover:text-[#d8947c] cursor-pointer"
                >
                  Prières
                </Link>
              </li>

              <li>
                <Link
                  href="/#TestimonialsSection"
                  onClick={(e) => handleScrollToSection(e, "TestimonialsSection")}
                  className="hover:text-[#d8947c] cursor-pointer"
                >
                  Témoignages
                </Link>
              </li>

              <li>
                <Link
                  href="/#RessourcesSection"
                  onClick={(e) => handleScrollToSection(e, "RessourcesSection")}
                  className="hover:text-[#d8947c] cursor-pointer"
                >
                  Enseignements 
                </Link>
              </li>
                    
              <li>
                <Link
                  href="/#VisionSection"
                  onClick={(e) => handleScrollToSection(e, "VisionSection")}
                  className="hover:text-[#d8947c] cursor-pointer"
                >
                  Notre vision
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-[#d8947c]">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/trouver-eglise" className="font-semibold text-[#8B1E3F] hover:text-[#d8947c]">
                  Trouver une église
                </Link>
              </li>
            </ul>
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="hidden lg:flex items-center gap-4 ml-6">
              <Link
                href="/volunteers/login"
                className="bg-[#d8947c] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#c6816a] transition"
              >
                Espace bénévoles
              </Link>
            </div>

            {/* MOBILE MENU BTN */}
            <button
              type="button"
              className="lg:hidden text-3xl"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer le menu principal" : "Ouvrir le menu principal"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
            </button>
          </div>
        </header>

      {/* ================= MOBILE MENU ================= */}
      {isOpen && (
        <div
          id="mobile-navigation"
          ref={menuRef}
          role="navigation"
          aria-label="Navigation mobile"
          className="fixed top-20 right-4 z-50 bg-white shadow-xl rounded-xl p-6 flex flex-col gap-4 w-[260px]"
        >

          <button
            onClick={(e) => handleScrollToSection(e, "PrayerWallSection")}
            className="text-left hover:text-[#d8947c]"
          >
            Prières
          </button>

          <button
            onClick={(e) => handleScrollToSection(e, "TestimonialsSection")}
            className="text-left hover:text-[#d8947c]"
          >
            Témoignages
          </button>

          <button
            onClick={(e) => handleScrollToSection(e, "RessourcesSection")}
            className="text-left hover:text-[#d8947c]"
          >
            Enseignements
          </button>
          <button
            onClick={(e) => handleScrollToSection(e, "VisionSection")}
            className="text-left hover:text-[#d8947c]"
          >
            Notre vision
          </button>

          <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link
            href="/trouver-eglise"
            className="font-semibold text-[#8B1E3F]"
            onClick={() => setIsOpen(false)}
          >
            Trouver une église
          </Link>

          <Link
            href="/volunteers/login"
            className="bg-[#d8947c] text-white text-center py-2 rounded-lg font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Espace bénévoles
          </Link>
        </div>
      )}

      {/* OFFSET */}
      <div className="h-[80px]" />
    </>
  );
};

export default Navbar;
