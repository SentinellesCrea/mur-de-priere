"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { FaPrayingHands, FaUserSlash } from "react-icons/fa";
import { AiOutlineComment } from "react-icons/ai";
import { fetchApi } from "@/lib/fetchApi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const PAGE_SIZE_DESKTOP = 4;
const PAGE_SIZE_MOBILE = 3;
const SWIPE_THRESHOLD = 80;

export default function PrayerWallSection() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState(null);

  const [activeCommentPrayerId, setActiveCommentPrayerId] = useState(null);
  const [commentsByPrayer, setCommentsByPrayer] = useState({});
  const [commentsCountByPrayer, setCommentsCountByPrayer] = useState({});
  const [newComments, setNewComments] = useState({
    showForm: false,
    authorName: "",
  });


  /* ================= DETECT MOBILE ================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    const loadPrayers = async () => {
      try {
        setLoading(true);
        const data = await fetchApi("/api/prayerRequests");
        setPrayers(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPrayers();
  }, []);


  useEffect(() => {
    const loadCommentsCount = async () => {
      try {
        const data = await fetchApi("/api/comments/count");
        setCommentsCountByPrayer(data || {});
      } catch (error) {
        console.error("Erreur chargement compteur commentaires", error);
      }
    };

    loadCommentsCount();
  }, []);

  useEffect(() => {
  console.log("🧮 commentsCountByPrayer =", commentsCountByPrayer);
  console.log("🙏 prayers =", prayers.map(p => p._id));
}, [commentsCountByPrayer, prayers]);


  /* ================= COMMENTAIRES ================= */

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

      setCommentsCountByPrayer((prev) => ({
        ...prev,
        [prayerId]: (prev[prayerId] || 0) + 1,
      }));

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
      setPrayers((prev) =>
        prev.map((request) =>
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

/* ================= NAV ================= */

  const PAGE_SIZE = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
  const totalPages = Math.ceil(prayers.length / PAGE_SIZE);

  const pagedPrayers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return prayers.slice(start, start + PAGE_SIZE);
  }, [prayers, page, PAGE_SIZE]);

  
  const paginate = (newDirection) => {
    setDirection(newDirection);
    setPage((p) => {
      const next = p + newDirection;
      if (next < 0) return 0;
      if (next >= totalPages) return totalPages - 1;
      return next;
    });
  };

  function getPagination(current, total) {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  }


  const PrayerAuthorHeader = ({ prayer }) => {
    const isAnonymous = prayer.name === "Anonyme";

    return (
      <div className="flex gap-3 items-center mb-4">
        {isAnonymous ? (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <FaUserSlash />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#d8947c]/10 flex items-center justify-center font-bold text-[#d8947c]">
            {prayer.name?.charAt(0)}
          </div>
        )}

        <div>
          <p className="text-lg font-bold">
            {isAnonymous ? "Anonyme" : prayer.name}
          </p>
        </div>
      </div>
    );
  };



  return (
    <section id="PrayerWallSection" className="w-full py-16 sm:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* ================= HEADER ================= */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}
          >
            Le Mur de Prière
          </h2>
          <p className="text-gray-500 mt-2">
            Intercédez pour les autres.
          </p>
          <p className="text-gray-500 mt-2">
            Si vous êtes touché par une demande de prière et que vous souhaitez prier pour ce sujet,
            <br />
            montrez votre soutien en cliquant sur le bouton « Je prie ».
          </p>

        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <p className="text-center text-gray-400">
            Chargement des demandes de prière…
          </p>
        ) : (
          <>
            {/* ================= ANIMATED GRID ================= */}
            <div className="relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -120 : 120, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  drag={isMobile ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (!isMobile) return;
                    if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
                    if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
                  }}
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {pagedPrayers.map((p) => {
                    const isAnonymous = p.name === "Anonyme";

                    return (
                      <div
                        key={p._id}
                        className="bg-white p-6 rounded-xl border border-transparent hover:border-[#d8947c]/20 transition"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 mb-4">
                            {isAnonymous ? (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <FaUserSlash />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#d8947c]/10 flex items-center justify-center font-bold text-[#d8947c]">
                                {p.name?.charAt(0)}
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-bold">
                                {isAnonymous ? "Anonyme" : p.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(p.datePublication).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-2 text-[#d8947c] text-xs font-bold">
                            <FaPrayingHands />
                            {p.nombrePriants} ont prié
                          </span>
                        </div>

                        {/* Content */}
                        <h4 className="font-bold mb-2">{p.category}</h4>

                        <p className="text-sm text-gray-600 line-clamp-3">
                          {p.prayerRequest}
                        </p>

                        <button
                          onClick={() => setSelectedPrayer(p)}
                          className="mt-2 text-sm font-semibold text-[#d8947c] hover:underline"
                        >
                          Lire la suite..
                        </button>


                        {/* Footer */}
                        <div className="flex items-center mt-2 justify-between">
                          {p.allowComments ? (
                            <button
                              onClick={() => {
                                const isSame = activeCommentPrayerId === p._id;
                                setActiveCommentPrayerId(isSame ? null : p._id);

                                if (!commentsByPrayer[p._id]) {
                                  loadCommentsForPrayer(p._id);
                                }
                              }}
                              className="relative text-[#d8947c] hover:text-[#c77a5b] transition"
                            >
                              <AiOutlineComment size={22} />

                              {Number(commentsCountByPrayer[p._id]) > 0 && (
                                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px]
                                                 px-1 flex items-center justify-center rounded-full
                                                 bg-red-500 text-white text-[10px] font-bold leading-none">
                                  {commentsCountByPrayer[p._id]}
                                </span>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              Commentaires désactivés
                            </span>
                          )}

                          <button
                            onClick={() => handlePrayClick(p._id)}
                            className="bg-[#d8947c] hover/text-[#d8947c] px-2 py-1 rounded-lg text-sm font-bold
                                       hover:bg-[#d8947c]/10 text-white transition"
                          >
                            Je prie
                          </button>
                        </div>

                        {p.allowComments === true && activeCommentPrayerId === p._id && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">
                              Commentaires d’encouragement :
                            </h4>

                            {commentsByPrayer[p._id]?.length > 0 ? (
                              commentsByPrayer[p._id].map((comment) => (
                                <div
                                  key={comment._id}
                                  className="bg-gray-100 text-sm text-gray-800 p-2 rounded"
                                >
                                  <strong>{comment.authorName || "Anonyme"}</strong> : {comment.text}
                                </div>
                              ))
                            ) : (
                              <p className="text-sm italic text-gray-500">
                                Aucun commentaire pour cette prière pour le moment.
                                Soyez le premier à encourager !
                              </p>
                            )}
                          </div>
                        )}

                        {p.allowComments === true && activeCommentPrayerId === p._id && (
                          <div className="mt-2 flex justify-start">
                            <button
                              onClick={() =>
                                setNewComments((prev) => ({
                                  ...prev,
                                  showForm: true,
                                }))
                              }
                              className="bg-[#7a9c77] text-white text-xs px-2 py-1 rounded hover:bg-[#6d8764]"
                            >
                              Ajouter un commentaire
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
              {getPagination(page + 1, totalPages).map((item, index) => {
                if (item === "...") {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-2 text-gray-400 select-none"
                    >
                      …
                    </span>
                  );
                }

                const pageIndex = item - 1;

                return (
                  <button
                    key={item}
                    onClick={() => {
                      setDirection(pageIndex > page ? 1 : -1);
                      setPage(pageIndex);
                    }}
                    className={`
                      w-9 h-9 rounded-full text-sm font-bold transition
                      ${
                        page === pageIndex
                          ? "bg-[#d8947c] text-white shadow-md"
                          : "bg-white border border-gray-300 text-gray-600 hover:bg-[#d8947c]/10"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

          </>
        )}
      </div>

      {/* ================= MODAL PRAYER ================= */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <div className="bg-white max-w-lg w-full mx-4 rounded-2xl shadow-xl p-6 relative animate-fadeIn">

            {/* Close */}
            <button
              onClick={() => setSelectedPrayer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>

            {/* ===== USER HEADER (réutilisé) ===== */}
            <PrayerAuthorHeader prayer={selectedPrayer} />

            {/* Header */}
            <h3 className="text-lg font-bold mb-1">
              {selectedPrayer.category}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Publié le{" "}
              {new Date(selectedPrayer.datePublication).toLocaleDateString("fr-FR")}
            </p>

            {/* Content */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedPrayer.prayerRequest}
            </p>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPrayer(null)}
                className="px-5 py-2 rounded-lg bg-[#d8947c] text-white font-semibold hover:opacity-90 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL COMMENTAIRE ================= */}

      {newComments.showForm && activeCommentPrayerId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-auto">

            <h3 className="text-lg font-bold mb-2">
              Ajouter un commentaire
            </h3>

            <input
              type="text"
              placeholder="Votre prénom ou pseudo (optionnel)"
              className="w-full p-2 border rounded text-sm mb-2"
              value={newComments.authorName || ""}
              onChange={(e) =>
                setNewComments((prev) => ({
                  ...prev,
                  authorName: e.target.value,
                }))
              }
            />

            <textarea
              rows={3}
              placeholder="Écris un mot d'encouragement..."
              className="w-full p-2 border rounded text-sm mb-4"
              value={newComments[activeCommentPrayerId] || ""}
              onChange={(e) =>
                setNewComments((prev) => ({
                  ...prev,
                  [activeCommentPrayerId]: e.target.value,
                }))
              }
            />

            <div className="flex justify-between">
              <button
                onClick={() =>
                  setNewComments((prev) => ({ ...prev, showForm: false }))
                }
                className="text-sm text-gray-500 hover:underline"
              >
                Annuler
              </button>

              <button
                onClick={() => handleAddComment(activeCommentPrayerId)}
                className="bg-[#d4967d] text-white px-4 py-1 text-sm rounded hover:bg-[#c1836a]"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}


    </section>
  );
}
