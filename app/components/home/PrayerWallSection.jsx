"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiChevronLeft, FiChevronUp } from "react-icons/fi";
import { FaPrayingHands, FaUserSlash, FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import { AiOutlineComment } from "react-icons/ai";
import { fetchApi } from "@/lib/fetchApi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import PrayersModal from "./prayerWall/modals/PrayersModal";

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
  const [selectedCommentsPrayer, setSelectedCommentsPrayer] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");

  const [replyToComment, setReplyToComment] = useState(null);

  const [likedIds, setLikedIds] = useState([]);
  const [likeCooldown, setLikeCooldown] = useState({});
  const [openReplies, setOpenReplies] = useState({});

  const [mounted, setMounted] = useState(false);
  const [highlightId, setHighlightId] = useState(null);


  useEffect(() => {
    setMounted(true);
  }, []);


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


  /* ================= LECTURE URL HIGHLIGHT ================= */

  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(window.location.search);
    const highlight = params.get("highlight");

    if (highlight) {
      setHighlightId(highlight);
    }
  }, [mounted]);


  /* ================= HIGHLIGHT DYNAMIQUE ================= */

  useEffect(() => {
    if (!highlightId || !prayers.length) return;

    const index = prayers.findIndex(
      (p) => p._id === highlightId
    );

    if (index === -1) return;

    const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
    const targetPage = Math.floor(index / pageSize);

    setDirection(targetPage > page ? 1 : -1);
    setPage(targetPage);

    setTimeout(() => {
      const element = document.getElementById(`prayer-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        element.classList.add("highlight-prayer");

        setTimeout(() => {
          element.classList.remove("highlight-prayer");

          // ✅ Nettoyage URL ici seulement
          window.history.replaceState(
            {},
            "",
            window.location.pathname
          );

        }, 2000);
      }
    }, 400);

  }, [highlightId, prayers, isMobile]);

  /* ================= CHARGEMENT COMMENTAIRES COUNT ================= */

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
  }, [commentsCountByPrayer, prayers]);


  /* ================= CHARGEMENT DU TOKEN ================= */

  const [authorToken, setAuthorToken] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("commentAuthorToken="))
      ?.split("=")[1];

    setAuthorToken(token);
  }, []);


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


  /* ================= LIKE ================= */
  const handleLikeComment = async (commentId) => {
    const now = Date.now();
    const LIMIT = 3;
    const WINDOW = 30000;

    const cooldownData = likeCooldown[commentId] || {
      count: 0,
      firstClick: now,
      blockedUntil: 0,
    };

    /* ================= BLOCAGE ================= */

    if (cooldownData.blockedUntil > now) {
      toast.error("Les likes sont bloqués temporairement.", {
        autoClose: 30000,
        closeOnClick: false,
      });
      return;
    }

    /* ================= RESET FENÊTRE ================= */

    if (now - cooldownData.firstClick > WINDOW) {
      cooldownData.count = 0;
      cooldownData.firstClick = now;
    }

    cooldownData.count++;

    /* ================= TROP DE CLICS ================= */

    if (cooldownData.count > LIMIT) {
      cooldownData.blockedUntil = now + WINDOW;

      setLikeCooldown((prev) => ({
        ...prev,
        [commentId]: cooldownData,
      }));

      toast.error("Les likes sont bloqués pendant 30 secondes.", {
        autoClose: 30000,
        closeOnClick: false,
      });

      return;
    }

    setLikeCooldown((prev) => ({
      ...prev,
      [commentId]: cooldownData,
    }));

    /* ================= LIKE NORMAL ================= */

    const alreadyLiked = likedIds.includes(commentId);

    try {
      const data = await fetchApi(`/api/comments/likes/${commentId}`, {
        method: "PUT",
        body: { remove: alreadyLiked },
      });

      setCommentsByPrayer((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((prayerId) => {
          updated[prayerId] = updated[prayerId].map((c) =>
            c._id === commentId ? { ...c, likes: data.likes } : c
          );
        });

        return updated;
      });

      let updatedLikes;

      if (alreadyLiked) {
        updatedLikes = likedIds.filter((id) => id !== commentId);
      } else {
        updatedLikes = [...likedIds, commentId];
      }

      setLikedIds(updatedLikes);

    } catch {
      toast.error("Erreur lors du like");
    }
  };

  /* ================= Ajouter un commentaire ================= */

  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    return roots;
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
          parentComment: replyToComment || null,
          authorName: author && author.length > 0 ? author : "Un intercesseur anonyme",
        },
      });

      toast.success("Commentaire envoyé avec succès 🙌");
      setReplyToComment(null); // ✅ reset reply
      setNewComments((prev) => ({ ...prev, showForm: false, [prayerId]: "" }));
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


  /* ================= Modifier un commentaire ================= */

  const handleEditComment = async () => {
  if (!editedText.trim()) {
    toast.warning("Le commentaire est vide.");
    return;
  }

  try {
    const data = await fetchApi(`/api/comments/edit/${editingComment._id}`, {
      method: "PUT",
      body: {
        text: editedText,
      },
    });

    setCommentsByPrayer((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((prayerId) => {
        updated[prayerId] = updated[prayerId].map((c) =>
          c._id === editingComment._id ? { ...c, text: data.text } : c
        );
      });

      return updated;
    });

    toast.success("Commentaire modifié");

    setEditingComment(null);

  } catch (err) {
    toast.error("Erreur lors de la modification");
  }
};

/* ================= Supprimer un commentaire ================= */

const handleDeleteComment = async (commentId) => {
  try {
    const result = await fetchApi(`/api/comments/delete/${commentId}`, {
      method: "DELETE",
    });

    toast.success("Commentaire supprimé");

    setCommentsByPrayer((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((prayerId) => {
        updated[prayerId] = updated[prayerId].filter(
          (c) => c._id !== commentId
        );
      });

      return updated;
    });

  } catch (err) {
    toast.error(err.message || "Erreur suppression commentaire");
  }
};


/* =================  ================= */

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


/* =================  ================= */

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


/* ================= REPONSE COMMENTAIRE ================= */


  const commentsTreeByPrayer = useMemo(() => {
    const result = {};

    Object.keys(commentsByPrayer).forEach((prayerId) => {
      result[prayerId] = buildCommentTree(commentsByPrayer[prayerId]);
    });

    return result;
  }, [commentsByPrayer]);

  

  const CommentItem = ({ comment, isReply = false }) => {
  const isOwner = comment.authorToken && comment.authorToken === authorToken;

  const repliesOpen = openReplies[comment._id];
  const replies = comment.replies ?? [];
  const repliesCount = replies.length;
  const firstReply = replies[0];

  return (
    <div className={`${isReply ? "ml-6 border-l pl-4 border-gray-300 mt-2" : "mt-2"}`}>

      <div className="bg-gray-100 text-sm text-gray-800 p-2 rounded">

        <p>
          <strong>{comment.authorName || "Anonyme"}</strong> : {comment.text}
        </p>

        <div className="flex items-center justify-between mt-2">

          {/* LIKE */}
          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center gap-1 text-sm font-bold ${
              likedIds.includes(comment._id)
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            <FaHeart size={14} />
            {comment.likes || 0}
          </button>

          <div className="flex items-center gap-4">

            {isOwner && (
              <button
                onClick={() => {
                  setEditingComment(comment);
                  setEditedText(comment.text);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                <FaEdit size={14} />
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                <FaTrash size={14} />
              </button>
            )}

            {!isReply && (
              <button
                onClick={() => {
                  setReplyToComment(comment._id);
                  setNewComments((prev) => ({
                    ...prev,
                    showForm: true,
                  }));
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Répondre
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ================= PREMIÈRE RÉPONSE ================= */}

      {!isReply && repliesCount >= 1 && !repliesOpen && (
        <CommentItem
          comment={firstReply}
          isReply={true}
        />
      )}

      {/* ================= BOUTON VOIR PLUS ================= */}

      {!isReply && repliesCount > 1 && !repliesOpen && (
        <button
          onClick={() =>
            setOpenReplies((prev) => ({
              ...prev,
              [comment._id]: true,
            }))
          }
          className="text-xs text-[#d8947c] hover:underline mt-1"
        >
          Voir les {repliesCount} réponses
        </button>
      )}

      {/* ================= TOUTES LES RÉPONSES ================= */}

      {!isReply && repliesOpen && (
        <div className="space-y-2 mt-2">

          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              isReply={true}
            />
          ))}

          <button
            onClick={() =>
              setOpenReplies((prev) => ({
                ...prev,
                [comment._id]: false,
              }))
            }
            className="text-xs text-[#d8947c] hover:text-gray-600"
          >
            Masquer les réponses
          </button>

        </div>
      )}
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
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start"
                >
                  {pagedPrayers.map((p) => {
                    const isAnonymous = p.name === "Anonyme";

                    return (
                      <div
                        key={p._id}
                        id={`prayer-${p._id}`}
                        className="bg-white p-6 rounded-xl shadow-lg border border-transparent 
                                  hover:border-[#d8947c]/20 transform
                                  transition-all duration-300 ease-out
                                  hover:-translate-y-1 hover:scale-[1.02] self-start"
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
                              commentsTreeByPrayer[p._id]
                                ?.slice(0,3)
                                .map((comment) => (
                                  <CommentItem
                                    key={comment._id}
                                    comment={comment}
                                  />
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
                          <div className="mt-2 flex items-center justify-between">
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

                            <button
                              onClick={() => setActiveCommentPrayerId(null)}
                              className="flex text-gray-500 hover:text-gray-800 transition p-1"
                            >
                              <FiChevronUp size={20} />
                              replier
                            </button>

                          </div>
                        )}

                        {commentsByPrayer[p._id]?.length > 2 && activeCommentPrayerId === p._id && (
                          <button
                            onClick={() => setSelectedCommentsPrayer(p._id)}
                            className="text-xs text-[#d8947c] hover:underline mt-2"
                          >
                            Voir tous les commentaires ({commentsByPrayer[p._id].length})
                          </button>
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

      <PrayersModal
        type="prayer"
        isOpen={!!selectedPrayer}
        prayer={selectedPrayer}
        onClose={() => setSelectedPrayer(null)}
      />

      <PrayersModal
        type="comment-form"
        isOpen={newComments.showForm}
        authorName={newComments.authorName}
        commentText={newComments[activeCommentPrayerId]}
        setAuthorName={(v) =>
          setNewComments((prev) => ({ ...prev, authorName: v }))
        }
        setCommentText={(v) =>
          setNewComments((prev) => ({
            ...prev,
            [activeCommentPrayerId]: v,
          }))
        }
        onSubmitComment={() => handleAddComment(activeCommentPrayerId)}
        onClose={() =>
          setNewComments((prev) => ({ ...prev, showForm: false }))
        }
      />

      <PrayersModal
        type="comments-list"
        isOpen={!!selectedCommentsPrayer}
        comments={commentsTreeByPrayer[selectedCommentsPrayer]}
        openReplies={openReplies}
        setOpenReplies={setOpenReplies}
        handleLikeComment={handleLikeComment}
        handleDeleteComment={handleDeleteComment}
        setEditingComment={setEditingComment}
        setEditedText={setEditedText}
        authorToken={authorToken}
        likedIds={likedIds}
        onClose={() => setSelectedCommentsPrayer(null)}
      />

      <PrayersModal
        type="edit-comment"
        isOpen={!!editingComment}
        commentText={editedText}
        setCommentText={setEditedText}
        onSubmitComment={handleEditComment}
        onClose={() => setEditingComment(null)}
      />

    </section>
  );
}
