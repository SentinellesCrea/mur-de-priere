"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VideoCard from "../components/VideoCard";
import VideoModal from "../components/VideoModal";
import TextModal from "../components/TextModal";
import Button from "../components/ui/button"; // si tu as un composant bouton stylisé

export default function ApprendreAPrierPage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const videosPerPage = 7;
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const displayedVideos = videos.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage
  );

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement vidéos :", err);
        setVideos([]);
      }
    };
    fetchVideos();
  }, []);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto mt-14 px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Colonne gauche : enseignement */}
       
          <div className="font-light text-gray-800 leading-relaxed">
            <h1 className="text-4xl font-bold mb-6">
              Apprendre à prier avec foi et efficacité
            </h1>

            <p className="text-lg mb-6">
              La prière est une clé puissante pour transformer nos vies, nos familles, et nos situations.
              Mais pour beaucoup, prier peut sembler intimidant, abstrait ou inaccessible.
            </p>

            <p className="text-lg mb-6">
              Cette page a été pensée pour vous guider pas à pas dans l’apprentissage de la prière
              — qu’il s’agisse de poser les premières pierres d’une vie spirituelle solide, ou de renouveler une relation profonde avec Dieu.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">
              1. Qu’est-ce que la prière selon la Bible ?
            </h2>
            <p className="text-lg mb-6">
              La prière n’est pas un monologue religieux, mais un dialogue intime avec notre Père céleste.
              Jésus nous a appris que nous pouvions nous adresser à Dieu avec simplicité et confiance, sans masque ni prétention.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">
              2. Des modèles inspirants de prière
            </h2>
            <p className="text-lg mb-6">
              La Bible est remplie de prières puissantes : celles de David dans les Psaumes,
              de Paul dans ses lettres, de Jésus dans les Évangiles. Ces prières sont autant
              d’exemples d’amour, de combat spirituel, de pardon et de foi.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">
              3. Comment développer une vie de prière constante ?
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-lg">
              <li>Réservez un moment quotidien, même court, pour vous isoler avec Dieu</li>
              <li>Priez avec la Parole : les psaumes, les promesses, les évangiles</li>
              <li>Notez vos sujets de prière et relisez-les avec gratitude</li>
              <li>Entourez-vous de personnes qui prient : rejoignez un groupe de prière ou une église locale</li>
            </ul>

            <p className="text-lg mt-6">
              La prière change les cœurs, éclaire les décisions, restaure les vies. Peu importe votre niveau de foi,
              commencez aujourd’hui, simplement. Dieu entend chaque mot, même ceux que vous n’arrivez pas à dire.
            </p>
          </div>


        {/* Vidéos à droite */}
        <div className="relative border-l border-gray-200 px-6">
          <h2 className="text-2xl font-bold mb-4">Vidéos d’enseignement</h2>

          <div className={`${selectedVideo || selectedText ? "blur-sm pointer-events-none" : ""} space-y-4`}>
            {displayedVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onTextClick={(text) => setSelectedText(text)}
                onVideoClick={(vid) => setSelectedVideo(vid)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button onClick={prevPage} disabled={currentPage === 0}>
                ◀
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage + 1} sur {totalPages}
              </span>
              <Button onClick={nextPage} disabled={currentPage + 1 >= totalPages}>
                ▶
              </Button>
            </div>
          )}

          {/* Modales */}
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
          <TextModal text={selectedText} onClose={() => setSelectedText(null)} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
