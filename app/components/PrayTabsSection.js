"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import CardContent from "./ui/CardContent";
import Button from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { toast } from 'react-toastify';

const PrayTabsSection = () => {
  const [activeTab, setActiveTab] = useState("prayers");
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [testimonies, setTestimonies] = useState([]);
  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [testimonyText, setTestimonyText] = useState("");
  const [currentTestimonyPage, setCurrentTestimonyPage] = useState(0);
  const [videos, setVideos] = useState([]);
  const [modalContent, setModalContent] = useState(null);

  const tabs = [
    { id: "prayers", title: "Liste de prières", text: "text-[#bb7e68]", image: "/images/femmequiprie.jpg" },
    { id: "testimonies", title: "Les témoignages", text: "text-green-800", image: "/images/temoignages.png" },
    { id: "encouragements", title: "Les Encouragements", text: "text-[#1c30fa]", image: "/images/prierensemble.jpg" }
  ];

  useEffect(() => {
    const fetchPrayerRequests = async () => {
      try {
        const response = await fetch('/api/prayerRequests');
        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        const data = await response.json();
        setPrayerRequests(Array.isArray(data) ? data.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication)) : []);
      } catch {
        setError("Impossible de charger les prières.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrayerRequests();
  }, []);

  const [errorTestimonies, setErrorTestimonies] = useState(null);

  useEffect(() => {
      const fetchTestimonies = async () => {
        try {
          const responseTestimonies = await fetch("/api/testimonies/approved");
          if (!responseTestimonies.ok) throw new Error("Erreur lors du chargement des témoignages");
          const data = await responseTestimonies.json();
          setTestimonies(data);
        } catch (error) {
          setErrorTestimonies("Impossible de charger les témoignages.");
        }
      };
      fetchTestimonies();
    }, []);


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

      fetchVideos(); // 🔥 Tu dois appeler fetchVideos ici !

    }, []); // 👈 Le tableau des dépendances


    useEffect(() => {
      const handleHashChange = () => {
        const hash = window.location.hash.replace("#", "");
        if (["prayers", "testimonies", "encouragements"].includes(hash)) {
          setActiveTab(hash);
        }
      };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // au premier chargement

      return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);


  const requestsPerPage = 7;
  const totalPages = Math.ceil(prayerRequests.length / requestsPerPage);
  const displayedRequests = prayerRequests.slice(currentPage * requestsPerPage, (currentPage + 1) * requestsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : prev));

  const testimoniesPerPage = 7;
  const totalPagestestimonies = Math.ceil(testimonies.length / testimoniesPerPage);
  const displayedTestimonies = testimonies.slice(currentPage * testimoniesPerPage, (currentPage + 1) * testimoniesPerPage);

  const encouragementsPerPage = 7;
  const totalPagesencouragements = Math.ceil(videos.length / encouragementsPerPage);
  const displayedEncouragements = videos.slice(currentPage * encouragementsPerPage, (currentPage + 1) * encouragementsPerPage);

  const handlePrayClick = async (id) => {
  try {
    // 🔒 Vérifie si l'utilisateur a déjà prié pour cette demande
    const prayedRequests = JSON.parse(localStorage.getItem("prayedRequests") || "[]");
    if (prayedRequests.includes(id)) {
      toast.info("Tu as déjà indiqué que tu priais pour cette demande, il n'est donc pas nécessaire de le répéter. Continue de prier avec foi, car assurément ta prière peut changer la situation. 🙏",
      {
        position: "top-center", // ✅ chaîne de caractères correcte
      });
      return;
    }

    const response = await fetch("/api/prayerRequests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Une erreur est survenue.");
    }

    toast.success("Merci d'avoir prié 🙌");

    // ✅ Sauvegarde l’ID dans localStorage
    localStorage.setItem("prayedRequests", JSON.stringify([...prayedRequests, id]));

    // ✅ Mets à jour l'état local
    setPrayerRequests((prevRequests) =>
      prevRequests.map((request) =>
        request._id === id
          ? { ...request, nombrePriants: result.nombrePriants }
          : request
      )
    );
  } catch (error) {
    console.error("❌ Erreur :", error);
    alert(`Une erreur est survenue : ${error.message}`);
  }
};

    const extractYouTubeId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname.includes("youtube.com")) {
      const v = parsedUrl.searchParams.get("v");
      return v;
    }

    if (hostname.includes("youtu.be")) {
      const path = parsedUrl.pathname;
      return path.startsWith("/") ? path.slice(1) : path;
    }

    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      return embedMatch[1];
    }

    return null;
  } catch (e) {
    console.error("Erreur d'extraction de l'URL YouTube :", e);
    return null;
  }
};


      const handleSubmitTestimony = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch("/api/testimonies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, testimony: testimonyText })
        });

        // Vérification si la réponse est un échec (status 400)
        if (response.status === 400) {
          const data = await response.json(); // Récupère les données du message d'erreur de l'API
          toast.error(data.message || 'Erreur inconnue', {
            autoClose: 5000,  // Le toast restera visible pendant 5 secondes
          });
        } else {
          // Si la réponse est ok, on procède à l'ajout du témoignage
          if (response.ok) {
            const newTestimony = await response.json();
            setTestimonies([newTestimony, ...testimonies]); // Ajoute le témoignage à la liste
            setShowTestimonyForm(false); // Ferme le formulaire
            setFirstName(""); // Réinitialise le prénom
            setTestimonyText(""); // Réinitialise le texte du témoignage

            // Affiche un toast de succès
            toast.success("Merci pour votre témoignage !", {
              autoClose: 5000, // Le toast restera visible pendant 5 secondes
            });
          } else {
            // Si la réponse n'est pas ok, on peut afficher une erreur
            toast.error("Erreur lors de l'envoi du témoignage.");
          }
        }
      } catch (error) {
        // Si une erreur survient pendant l'exécution de la requête
        toast.error("Erreur lors de l'envoi du témoignage : " + error.message);
      }
    };

  

  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedTestimonies") || "[]");
    setLikedIds(stored);
  }, []);

  const handleLike = async (id) => {
    const alreadyLiked = likedIds.includes(id);

    try {
      const res = await fetch(`/api/testimonies/likes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: alreadyLiked }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du like");

      const updatedTestimony = await res.json();

      // ✅ mettre à jour localement
      setTestimonies((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, likes: updatedTestimony.likes } : t
        )
      );

      // ✅ gérer l'état local des likes
      if (alreadyLiked) {
        setLikedIds((prev) => prev.filter((likedId) => likedId !== id));
      } else {
        setLikedIds((prev) => [...prev, id]);
      }

      // Afficher un message de succès
      toast.success("Merci pour votre soutien !");
      
    } catch (err) {
      console.error("❌ Erreur like :", err);
      toast.error("Erreur lors de la mise à jour du like");
    }
  };


  return (
    <div id="PrayTabsSectionDisplay" className="scroll-section w-full flex flex-col items-center py-6 bg-white px-4 md:px-10 mb-8">
      <div className="w-full max-w-6xl overflow-x-auto md:overflow-x-visible scroll-smooth [-webkit-overflow-scrolling:touch]">
          <div className="flex md:grid md:grid-cols-3 gap-4 w-max md:w-full snap-x snap-mandatory">
            {tabs.map((tab) => (
              <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[260px] sm:min-w-[100px] md:min-w-[200px] snap-start flex-shrink-0 cursor-pointer flex flex-col items-center transition transform hover:-translate-y-2 duration-300 ${
                    activeTab === tab.id ? tab.text : "text-gray-800"
                  }`}
                >
                <img
                  src={tab.image}
                  alt={tab.title}
                  className="h-48 sm:h-56 md:h-64 w-full object-cover rounded shadow"
                />
                <div className="bg-white text-sm sm:text-base md:text-lg px-4 py-2 shadow text-center w-full flex items-center justify-center gap-2">
                  <span>{tab.title}</span>
                  <FiChevronDown size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>



      <div className="mt-4 p-4 w-full max-w-6xl shadow-md bg-white rounded-lg">
        {loading ? (
          <p>Chargement des données...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        

        ) : activeTab === "prayers" ? (
              <>
              <div className="w-full max-w-6xl text-center mb-6">
                <h2 className="text-1xl md:text-3xl font-bold text-gray-900">
                  Prions les uns pour les autres.
                </h2>
              </div>

                {displayedRequests.map((request) => (
                  <div key={request._id} className="w-full mb-4 rounded-lg shadow">
                    <div className="flex">
                      {/* Barre colorée à gauche */}
                      <div className="w-2 bg-[#bf7b60] rounded-l-lg"></div>

                      {/* Contenu de la carte */}
                      <div className="flex-1 p-4">
                        <div className="relative flex flex-col">
                          <div className="text-left mb-2 text-[#bf7b60] font-semibold italic text-sm md:text-base">
                            - {request.name || "Anonyme"}
                            <span className="text-sm text-gray-600 absolute top-2 right-2">
                              {request.nombrePriants || 0}{" "}
                              {request.nombrePriants > 1 ? "personnes prient" : "personne prie"} pour toi.
                            </span>
                          </div>

                          <p className="mt-2 text-gray-800">
                            {request.prayerRequest || "Non disponible"}
                          </p>

                          <p className="mt-4 text-xs sm:text-sm md:text-base text-gray-500">
                            Publié le :{" "}
                            {new Date(request.datePublication).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }) || "Date inconnue"}
                          </p>
                        </div>

                        <div className="relative pt-2 flex justify-between">
                          <Button
                            onClick={() => handlePrayClick(request._id)}
                            className="absolute bottom-1 right-2 
                              px-2 py-1 text-xs 
                              sm:px-3 sm:py-1.5 sm:text-sm 
                              md:px-4 md:py-2 md:text-base 
                              bg-[#d4967d] text-white rounded-lg hover:bg-[#c47f64] 
                              transition transform hover:-translate-y-1 duration-300"
                          >
                            🙏 Je prie pour toi
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center items-center space-x-4 mt-6">
                  <Button className="bg-[#d4967d] hover:bg-gray-400" onClick={prevPage} disabled={currentPage === 0}>
                    <ChevronLeft />
                  </Button>
                  <span>{currentPage + 1} / {totalPages}</span>
                  <Button className="bg-[#d4967d] hover:bg-gray-400" onClick={nextPage} disabled={currentPage + 1 >= totalPages}>
                    <ChevronRight />
                  </Button>
                </div>
              </>
        

        ) : activeTab === "testimonies" ? (
              <div className="p-4 space-y-4">
                <Button
                  onClick={() => setShowTestimonyForm(true)}
                  className="flex flex-col md:flex-row items-center shadow-lg justify-center bg-green-800 hover:bg-gray-400 px-8 py-10 mx-auto"
                >
                  Déposer un témoignage
                </Button>

                {showTestimonyForm && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-auto">
                      <h2 className="text-2xl font-bold mb-4">Déposer un témoignage</h2>
                      <a className="font-bold text-green-800">
                        Votre témoignage peut changer une vie !
                      </a>
                      <br />
                      <br />
                      <a className="mb-8">
                        "Ils l'ont vaincu à cause du sang de l'Agneau et à cause de la parole de leur témoignage."
                      </a>
                      <br />
                      <a className="mb-8 text-green-800">Apocalypse 12:11</a>
                      <br />
                      <br />
                      <form onSubmit={handleSubmitTestimony}>
                        <input
                          type="text"
                          placeholder="Votre prénom"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full mb-4 p-3 border rounded"
                        />
                        <textarea
                          placeholder="Votre témoignage"
                          value={testimonyText}
                          onChange={(e) => setTestimonyText(e.target.value)}
                          className="w-full mb-4 p-3 border rounded h-32"
                        ></textarea>
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => setShowTestimonyForm(false)}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                          >
                            Annuler
                          </Button>
                          <Button type="submit" className="bg-green-800 text-white px-4 py-2 rounded-lg">
                            Envoyer
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {testimonies.length > 0 ? (
                    <>
                      {testimonies
                        .slice(currentTestimonyPage * testimoniesPerPage, (currentTestimonyPage + 1) * testimoniesPerPage)
                        .map((testimony) => (
                          <div key={testimony._id} className="w-full rounded-lg shadow-md bg-white flex">
                            {/* Bande verte à gauche */}
                            <div className="w-2 bg-green-800 rounded-l-lg"></div>

                            {/* Contenu du témoignage + like */}
                            <div className="flex-1 p-4 flex flex-col items-start">
                              <h3 className="font-semibold italic text-green-800 mb-4">
                                - {testimony.firstName || "Anonyme"}
                              </h3>
                              <p className="text-gray-700">{testimony.testimony}</p>
                              <span className="text-sm text-gray-500 mt-4">
                                Publié le :{" "}
                                {new Date(testimony.date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>

                              {/* ❤️ Bouton like centré */}
                              <div className="mt-4 flex justify-left w-full">
                                <button
                                  onClick={() => handleLike(testimony._id)}
                                  className={`flex items-center gap-2 transition-all duration-300 transform ${
                                    likedIds.includes(testimony._id)
                                      ? "text-pink-600 scale-105"
                                      : "text-gray-400 hover:scale-110"
                                  }`}
                                >
                                  <span className="text-2xl">
                                    {likedIds.includes(testimony._id) ? "❤️" : "🤍"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {testimony.likes > 0 && `${testimony.likes} J'aime`}
                                  </span>

                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                    <div className="flex justify-center items-center space-x-4 mt-6">
                      <Button
                        className="bg-green-800 hover:bg-gray-400 px-4 py-2 rounded"
                        onClick={prevPage}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft />
                      </Button>
                      <span>{currentPage + 1} / {totalPagestestimonies}</span>
                      <Button
                        className="bg-green-800 hover:bg-gray-400 px-4 py-2 rounded"
                        onClick={nextPage}
                        disabled={currentPage + 1 >= totalPagestestimonies}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p>Aucun témoignage pour le moment.</p>
                )}
              </div>
  

        ):activeTab === "encouragements" && (
              <div className="flex flex-col items-stretch gap-4 rounded-lg p-4">
                {videos.length === 0 ? (
                  <p>Aucune vidéo pour l’instant.</p>
                ) : (
                  videos.map((video) => {
                    const videoId = extractYouTubeId(video.url);
                    const isLongMessage = video.message && video.message.length > 500;
                    const truncatedMessage = isLongMessage
                      ? video.message.slice(0, 200) + "..."
                      : video.message;

                    return (
                      <div key={video._id} className="w-full bg-white rounded-lg shadow-md flex">
                        {/* Barre à gauche */}
                        <div className="w-2 bg-[#1c30fa] rounded-l-lg"></div>

                        {/* Contenu principal */}
                        <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
                          {/* Texte à gauche */}
                          <div className="md:w-1/2">
                            <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{truncatedMessage}</p>

                            {isLongMessage && (
                              <button
                                onClick={() => setModalContent(video.message)}
                                className="text-[#bb7e68] hover:underline text-sm mt-1"
                              >
                                Lire la suite
                              </button>
                            )}
                          </div>

                          {/* Vidéo à droite */}
                          <div className="md:w-1/2">
                            {videoId ? (
                              <div className="aspect-video">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title={video.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="rounded"
                                ></iframe>
                              </div>
                            ) : (
                              <p className="text-red-500">URL YouTube invalide</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* MODALE - Message complet */}
                {modalContent && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-xl w-full shadow-lg relative">
                      <h2 className="text-xl font-bold mb-4">Message complet</h2>
                      <p className="text-gray-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                        {modalContent}
                      </p>
                      <button
                        onClick={() => setModalContent(null)}
                        className="mt-4 bg-[#d4967d] hover:bg-[#c1836a] text-white px-4 py-2 rounded"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center items-center space-x-4 mt-6">
                      <Button
                        className="bg-[#1c30fa] hover:bg-gray-400 px-4 py-2 rounded"
                        onClick={prevPage}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft />
                      </Button>
                      <span>{currentPage + 1} / {totalPagesencouragements}</span>
                      <Button
                        className="bg-[#1c30fa] hover:bg-gray-400 px-4 py-2 rounded"
                        onClick={nextPage}
                        disabled={currentPage + 1 >= totalPagesencouragements}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                
              </div>
            )}
      </div>
    </div>
  );
};

export default PrayTabsSection;