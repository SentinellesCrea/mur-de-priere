"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faFacebook, faTwitter, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";

const scrollToSectionPray = (event) => {
    event.preventDefault(); // Empêche le lien de recharger la page

    const target = document.getElementById("PrayTabsSectionDisplay");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 ">
      <div className="container mx-auto px-6 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Logo et description */}
          <div>
            <h2 className="text-2xl font-bold">MUR DE PRIÈRE</h2>
            <p className="text-gray-400 mt-2">Un lieu de prière et de soutien spirituel.</p>

          </div>

          {/* Liens rapides */}
          <div>
              <h3 className="text-lg font-semibold">Liens rapides</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-[#a60030]">Accueil</Link></li> 
            <li>
              <Link className="text-gray-400 hover:text-[#a60030]" href="#" onClick={scrollToSectionPray}>
                Les Prières
              </Link>
            </li>
            <li>
              <Link className="text-gray-400 hover:text-[#a60030]" href="#" onClick={scrollToSectionPray}>
                Témoignages
              </Link>
            </li>
            <li>
              <Link className="text-gray-400 hover:text-[#a60030]" href="#" onClick={scrollToSectionPray}>
                Encouragements
              </Link>
            </li>
            <li><Link href="/contact" className="text-gray-400 hover:text-[#a60030]">Contact</Link></li>
              </ul>
          </div>
    
          {/* Réseaux sociaux */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold">Suivez-nous</h3>
              <p className="text-gray-400 mt-2">Nos réseaux sociaux sont faits pour propager la Parole de Dieu.</p>

              <div className="flex justify-center md:justify-start space-x-6 mt-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faTwitter} className="text-white text-2xl hover:text-blue-400" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faInstagram} className="text-white text-2xl hover:text-pink-500" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faYoutube} className="text-white text-2xl hover:text-red-500" />
                </a>
              </div>
            </div>


        </div>

          {/* Section mentions légales + crédits */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 uppercase gap-4 md:gap-0">

            {/* Mentions légales à gauche */}
            <div className="space-x-4">
              <Link href="/mentions-legales" className="text-gray-400 hover:text-white">Mentions Légales</Link>
              <Link href="/cgu" className="text-gray-400 hover:text-white">CGU</Link>
              <Link href="/confidentialite" className="text-gray-400 hover:text-white">Confidentialité</Link>
            </div>

            {/* Crédit à droite */}
            <div className="flex items-center gap-2">
              <span className="normal-case text-lg">Site créé et designé par</span>
              <img
                src="/images/LogoSentinellesCrea.png"
                alt="Sentinelles Créa"
                className="h-16"
              />
            </div>

          </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-700 pt-4 text-gray-500 text-sm text-center">
          © {new Date().getFullYear()} Sentinelles Groupe. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
