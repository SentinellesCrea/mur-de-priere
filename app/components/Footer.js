"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const scrollToSectionPray = (event) => {
  event.preventDefault();
  const target = document.getElementById("PrayTabsSectionDisplay");
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Logo et description */}
          <div>
            <Link href="/">
              <Image
                src="/images/Logo_mur_de_priere_blanc.png"
                alt="Logo Mur de Prière"
                width={148}
                height={84}
                priority
                className="mx-auto md:mx-0 transition transform hover:-translate-y-2 duration-300"
              />
            </Link>
            <p className="text-gray-400 mt-2">
              Un lieu de prière et de soutien spirituel.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#a60030]">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#a60030]"
                  onClick={scrollToSectionPray}
                >
                  Les Prières
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#a60030]"
                  onClick={scrollToSectionPray}
                >
                  Témoignages
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-[#a60030]"
                  onClick={scrollToSectionPray}
                >
                  Encouragements
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-[#a60030]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-bold">Suivez-nous</h3>
            <p className="text-gray-400 mt-2">
              Propager la Parole de Dieu à travers nos réseaux.
            </p>
            <div className="flex justify-center md:justify-start gap-5 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="text-white text-2xl hover:text-blue-400 transition transform hover:-translate-y-2 duration-300"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-white text-2xl hover:text-pink-500 transition transform hover:-translate-y-2 duration-300"
                />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faYoutube}
                  className="text-white text-2xl hover:text-red-500 transition transform hover:-translate-y-2 duration-300"
                />
              </a>
            </div>
          </div>

          {/* Mentions légales */}
          <div>
            <h3 className="text-lg font-semibold">Mentions légales</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-gray-400 hover:text-white"
                >
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-gray-400 hover:text-white">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-gray-400 hover:text-white"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de bas de page */}
        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} Sentinelles Groupe. Tous droits réservés.
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <span>Site créé et designé par</span>
            <img
              src="/images/LogoSentinellesCrea.png"
              alt="Logo Sentinelles Créa"
              className="h-8"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
