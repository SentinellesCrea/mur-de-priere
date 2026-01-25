"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import CardContent from "./ui/CardContent";
import Button from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { FaPrayingHands, FaRegComment } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchApi } from "@/lib/fetchApi";

const PrayTabsSection = () => {
  const [activeTab, setActiveTab] = useState("prayers");
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [testimonies, setTestimonies] = useState([]);
  const [currentTestimonyPage, setCurrentTestimonyPage] = useState(0);
  const [errorTestimonies, setErrorTestimonies] = useState(null);

  const [videos, setVideos] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  
  const [commentsByPrayer, setCommentsByPrayer] = useState({});
  const [activeCommentPrayerId, setActiveCommentPrayerId] = useState(null);
  const [newComments, setNewComments] = useState({});

  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [testimonyText, setTestimonyText] = useState("");

  const [likedIds, setLikedIds] = useState([]);

  /* ===================== REFRESH FUNCTIONS ===================== */

  const refreshPrayers = async () => {
    try {
      const data = await fetchApi("/api/prayerRequests");
      const sorted = Array.isArray(data)
        ? data.sort(
            (a, b) =>
              new Date(b.datePublication) - new Date(a.datePublication)
          )
        : [];
      setPrayerRequests(sorted);
    } catch (err) {
      console.error("Erreur refresh prières :", err.message);
      setError("Impossible de charger les prières.");
    }
  };

  const refreshTestimonies = async () => {
    try {
      const data = await fetchApi("/api/testimonies/approved");
      setTestimonies(data);
    } catch {
      setErrorTestimonies("Impossible de charger les témoignages.");
    }
  };

  /* ===================== INITIAL LOAD ===================== */

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        refreshPrayers(),
        refreshTestimonies(),
        fetchApi("/api/videos").then((v) =>
          setVideos(Array.isArray(v) ? v : [])
        ),
      ]);
      setLoading(false);
    };

    init();
  }, []);

  /* ===================== AUTO REFRESH EVENTS ===================== */

  useEffect(() => {
    const onPrayerCreated = () => refreshPrayers();
    const onTestimonyCreated = () => refreshTestimonies();

    window.addEventListener("prayer:created", onPrayerCreated);
    window.addEventListener("testimony:created", onTestimonyCreated);

    return () => {
      window.removeEventListener("prayer:created", onPrayerCreated);
      window.removeEventListener("testimony:created", onTestimonyCreated);
    };
  }, []);

  /* ===================== HASH TAB ===================== */

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["prayers", "testimonies", "encouragements"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /* ===================== LIKES ===================== */

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("likedTestimonies") || "[]"
    );
    setLikedIds(stored);
  }, []);



  const tabs = [
    { id: "prayers", title: "Liste de prières", text: "text-[#bb7e68]", image: "/images/femmequiprie.jpg" },
    { id: "testimonies", title: "Les témoignages", text: "text-green-800", image: "/images/temoignages.png" },
    { id: "encouragements", title: "Les Encouragements", text: "text-[#1c30fa]", image: "/images/prierensemble.jpg" }
  ];

  useEffect(() => {
    const fetchPrayerRequests = async () => {
      try {
        const data = await fetchApi('/api/prayerRequests');
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication)) : [];
        setPrayerRequests(sorted);
        fetchComments(sorted);
      } catch {
        setError("Impossible de charger les prières.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrayerRequests();
  }, []);

  const loadCommentsForPrayer = async (prayerId) => {
    try {
      const data = await fetchApi(`/api/comments/${prayerId}`);
      setCommentsByPrayer((prev) => ({ ...prev, [prayerId]: data }));
    } catch (error) {
      console.error(`Erreur chargement commentaires pour ${prayerId} :`, error.message);
      setCommentsByPrayer((prev) => ({ ...prev, [prayerId]: [] }));
    }
  };


  const fetchComments = async (requests) => {
    const result = {};
    for (const request of requests) {
      const id = request?._id;

      if (!id) {
        console.warn("❌ ID de prière manquant pour la requête :", request);
        result["unknown"] = [];
        continue;
      }

      try {
        const data = await fetchApi(`/api/comments/${id}`);
        result[id] = data;
      } catch (error) {
        console.error(`Erreur lors du fetch des commentaires pour ${id} :`, error.message);
        result[id] = [];
      }
    }

    setCommentsByPrayer(result);
  };


  const handleAddComment = async (prayerId) => {
    const text = newComments[prayerId];
    if (!text || text.trim().length < 3) {
      toast.warning("Ton message est trop court.");
      return;
    }

    try {
      const author = newComments.authorName?.trim();
      await fetchApi("/api/comments", {
        method: "POST",
        body: {
          prayerRequestId: prayerId,
          text,
          authorName: author && author.length > 0 ? author : "Un intercesseur anonyme",
        },
      });

      toast.success("Commentaire envoyé pour modération 🙌");
      setNewComments((prev) => ({ ...prev, [prayerId]: "" }));
      setActiveCommentPrayerId(null);

      // 🔄 Recharge les commentaires validés après soumission
      const updated = await fetchApi(`/api/comments/${prayerId}`);
      setCommentsByPrayer((prev) => ({ ...prev, [prayerId]: updated }));

    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi du commentaire.");
    }
  };



  const handlePrayClick = async (id) => {
    try {
      const prayedRequests = JSON.parse(localStorage.getItem("prayedRequests") || "[]");
      if (prayedRequests.includes(id)) {
        toast.info("Tu as déjà indiqué que tu priais pour cette demande.", { position: "top-center" });
        return;
      }

      const result = await fetchApi("/api/prayerRequests", {
        method: "PUT",
        body: { id },
      });

      toast.success("Merci d'avoir prié 🙌");
      localStorage.setItem("prayedRequests", JSON.stringify([...prayedRequests, id]));
      setPrayerRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, nombrePriants: result.nombrePriants } : request
        )
      );
    } catch (error) {
      console.error("❌ Erreur :", error);
      alert(`Une erreur est survenue : ${error.message}`);
    }
  };


  useEffect(() => {
  const fetchPrayerRequests = async () => {
    try {
      const data = await fetchApi("/api/prayerRequests");
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication))
        : [];
      setPrayerRequests(sorted);
    } catch (err) {
      console.error("Erreur chargement prières :", err.message);
      setError("Impossible de charger les prières.");
    } finally {
      setLoading(false);
    }
  };

  fetchPrayerRequests();
}, []);

  
  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const data = await fetchApi("/api/testimonies/approved");
        setTestimonies(data);
      } catch {
        setErrorTestimonies("Impossible de charger les témoignages.");
      }
    };
    fetchTestimonies();
  }, []);


  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await fetchApi("/api/videos");
        setVideos(Array.isArray(data) ? data : []);
      } catch {
        setVideos([]);
      }
    };
    fetchVideos();
  }, []);


  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["prayers", "testimonies", "encouragements"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedTestimonies") || "[]");
    setLikedIds(stored);
  }, []);


  const handleLike = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    try {
      const data = await fetchApi(`/api/testimonies/likes/${id}`, {
        method: "PUT",
        body: { remove: alreadyLiked },
      });
      setTestimonies((prev) =>
        prev.map((t) => (t._id === id ? { ...t, likes: data.likes } : t))
      );
      if (alreadyLiked) {
        setLikedIds((prev) => prev.filter((likedId) => likedId !== id));
      } else {
        setLikedIds((prev) => [...prev, id]);
      }
      toast.success("Merci pour votre soutien !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du like");
    }
  };


  const extractYouTubeId = (url) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      if (hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      }
      if (hostname.includes("youtu.be")) {
        return parsedUrl.pathname.slice(1);
      }
      const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
      return embedMatch ? embedMatch[1] : null;
    } catch (e) {
      console.error("Erreur d'extraction de l'URL YouTube :", e);
      return null;
    }
  };


  const handleSubmitTestimony = async (e) => {
    e.preventDefault();
    try {
      const newTestimony = await fetchApi("/api/testimonies", {
        method: "POST",
        body: { firstName, testimony: testimonyText },
      });

      setTestimonies([newTestimony, ...testimonies]);
      setShowTestimonyForm(false);
      setFirstName("");
      setTestimonyText("");

      toast.success("Merci pour votre témoignage !", {
        autoClose: 5000,
      });
      window.dispatchEvent(new Event("prayer:created"));

    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi du témoignage", {
        autoClose: 5000,
      });
    }
  };


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
                    <div className="w-2 bg-[#7a9c77] rounded-l-lg"></div>
                    <div className="flex-1 p-4">
                      <div className="relative flex flex-col">
                        <div className="text-left mb-2 text-[#bf7b60] font-semibold italic text-sm md:text-base">
                          - {request.name || "Anonyme"}
                          <span className="text-sm text-gray-600 absolute top-2 right-2">
                            {request.nombrePriants || 0} {request.nombrePriants > 1 ? "personnes prient" : "personne prie"} pour toi.
                          </span>
                        </div>

                        <p className="mt-2 text-gray-800">{request.prayerRequest || "Non disponible"}</p>

                        <p className="mt-4 text-xs sm:text-sm md:text-base text-gray-500">
                          Publié le : {new Date(request.datePublication).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }) || "Date inconnue"}
                        </p>
                      </div>

                    
                      {request.allowComments === true && (
                        <div
                          onClick={() => {
                            if (activeCommentPrayerId === request._id) {
                              // Si déjà ouvert, on referme
                              setActiveCommentPrayerId(null);
                            } else {
                              // Sinon, on charge et ouvre
                              setActiveCommentPrayerId(request._id);
                              loadCommentsForPrayer(request._id);
                            }
                          }}
                          className="mt-2 text-[#7a9c77] text-sm cursor-pointer hover:underline flex items-center gap-1"
                        >
                          <div className="flex items-center gap-1">
                            <FaRegComment className="h-5 w-5 sm:h-6 sm:w-6 transition-transform hover:scale-110" />
                            {commentsByPrayer[request._id]?.length > 0 && (
                              <span className="text-sm sm:text-base font-bold text-gray-700">
                                {commentsByPrayer[request._id].length}
                              </span>
                            )}
                          </div>
                          <span className="text-sm sm:text-base font-medium">
                            {activeCommentPrayerId === request._id
                              ? "Masquer les commentaires"
                              : ""}
                          </span>
                        </div>
                      )}

                      {/* 🙏 Bouton Je prie pour toi*/}
                      <div className="relative pt-2 flex justify-between">
                        <Button
                          onClick={() => handlePrayClick(request._id)}
                          className="absolute bottom-1 right-2 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-2 md:py-1 md:text-base bg-[#d4967d] text-white rounded-xl hover:bg-[#c47f64] transition transform hover:-translate-y-1 duration-300"
                        >
                          <FaPrayingHands className="inline" /> Je prie pour toi
                        </Button>
                      </div>


                      {request.allowComments === true &&
                        activeCommentPrayerId === request._id && (
                          <div className="mt-4 space-y-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              Commentaires d’encouragement :
                            </h4>

                            {commentsByPrayer[request._id]?.length > 0 ? (
                              commentsByPrayer[request._id].map((comment) => (
                                <div
                                  key={comment._id}
                                  className="bg-gray-100 text-sm text-gray-800 p-2 rounded"
                                >
                                  <strong>{comment.authorName}</strong> : {comment.text}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm italic text-gray-500">
                                Aucun commentaire pour cette prière pour le moment. Soyez le premier à encourager !
                              </p>
                            )}
                          </div>
                      )}


                      {request.allowComments === true && activeCommentPrayerId === request._id && (
                        <div className="mt-2 flex justify-start">
                          <Button
                            className="bg-[#7a9c77] text-white text-xs px-2 py-1 rounded hover:bg-[#6d8764]"
                            onClick={() => {
                              setNewComments((prev) => ({ ...prev, showForm: true }));
                              setActiveCommentPrayerId(request._id);
                            }}
                          >
                            Ajouter un commentaire
                          </Button>
                        </div>
                      )}

                      {newComments.showForm && activeCommentPrayerId === request._id && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-auto">
                            <h3 className="text-lg font-bold mb-2">Ajouter un commentaire</h3>
                            <input
                              type="text"
                              placeholder="Votre prénom ou pseudo (optionnel)"
                              className="w-full p-2 border rounded text-sm mb-2"
                              value={newComments.authorName || ""}
                              onChange={(e) => setNewComments((prev) => ({ ...prev, authorName: e.target.value }))}
                            />
                            <textarea
                              rows={3}
                              placeholder="Écris un mot d'encouragement..."
                              className="w-full p-2 border rounded text-sm mb-2"
                              value={newComments[activeCommentPrayerId] || ""}
                              onChange={(e) => setNewComments((prev) => ({ ...prev, [activeCommentPrayerId]: e.target.value }))}
                            />
                            <div className="flex justify-between">
                              <button
                                onClick={() => setNewComments((prev) => ({ ...prev, showForm: false }))}
                                className="text-sm text-gray-500 hover:underline"
                              >
                                Annuler
                              </button>
                              <Button
                                className="bg-[#d4967d] text-white px-4 py-1 text-sm rounded hover:bg-[#c1836a]"
                                onClick={() => handleAddComment(activeCommentPrayerId)}
                              >
                                Envoyer
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
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
                              <h3 className="font-semibold italic text-[#bf7b60] mb-4">
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
                                  <span className="text-m font-bold text-gray-700">
                                    {testimony.likes > 0 && `${testimony.likes}`}
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
                        <div className="w-2 bg-[#708090] rounded-l-lg"></div>

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
                        className="bg-[#708090] hover:bg-gray-400 px-4 py-2 rounded"
                        onClick={prevPage}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft />
                      </Button>
                      <span>{currentPage + 1} / {totalPagesencouragements}</span>
                      <Button
                        className="bg-[#708090] hover:bg-gray-400 px-4 py-2 rounded"
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