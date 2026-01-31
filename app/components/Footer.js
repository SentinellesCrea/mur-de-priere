"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faYoutube,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  /* ================= SCROLL HANDLER ================= */
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();

    // ✅ Déjà sur la home → scroll direct
    if (pathname === "/") {
      const target = document.getElementById(sectionId);
      if (!target) return;

      const yOffset = -90; // hauteur navbar
      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.history.pushState(null, "", `#${sectionId}`);
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // ❌ Pas sur la home → redirection + hash
    else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-14">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* ================= BRAND ================= */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-6">
            <Image
              src="/images/Logo_mur_de_priere_blanc.png"
              alt="Mur de Prière"
              width={140}
              height={80}
              className="invert"
              priority
            />
          </Link>

          <p className="text-sm text-gray-500 leading-relaxed">
            Un espace dédié à l’unité dans la prière, au soutien spirituel
            et à l’intercession au sein de la communauté chrétienne.
          </p>
        </div>

        {/* ================= NAVIGATION ================= */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-6">
            Navigation
          </h4>

          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#d8947c] transition">
                Accueil
              </Link>
            </li>

            <li>
              <button
                onClick={(e) => handleScrollToSection(e, "PrayerWallSection")}
                className="text-left hover:text-[#d8947c] transition"
              >
                Mur de Prière
              </button>
            </li>

            <li>
              <button
                onClick={(e) => handleScrollToSection(e, "TestimonialsSection")}
                className="text-left hover:text-[#d8947c] transition"
              >
                Témoignages
              </button>
            </li>

            <li>
              <button
                onClick={(e) => handleScrollToSection(e, "RessourcesSection")}
                className="text-left hover:text-[#d8947c] transition"
              >
                Encouragements
              </button>
            </li>

            <li>
              <Link
                href="/contact"
                className="hover:text-[#d8947c] transition"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= INFORMATIONS ================= */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-6">
            Informations
          </h4>

          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            <li>
              <Link
                href="/mentions-legales"
                className="hover:text-[#d8947c] transition"
              >
                Mentions légales
              </Link>
            </li>

            <li>
              <Link
                href="/cgu"
                className="hover:text-[#d8947c] transition"
              >
                Conditions d’utilisation
              </Link>
            </li>

            <li>
              <Link
                href="/confidentialite"
                className="hover:text-[#d8947c] transition"
              >
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= SOCIAL ================= */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-6">
            Restez connecté
          </h4>

          <div className="flex gap-4 mb-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#d8947c] hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#d8947c] hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#d8947c] hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Mur de Prière.
            <br />
            Tous droits réservés.
          </p>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>Site créé et designé par</span>
        <Image
          src="/images/Sentinelles-Crea-noir.png"
          alt="Sentinelles Créa"
          width={110}
          height={30}
        />
      </div>
    </footer>
  );
};

export default Footer;
