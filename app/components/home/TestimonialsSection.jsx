"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaHeart } from "react-icons/fa";
import { BsQuote } from "react-icons/bs";
import { fetchApi } from "@/lib/fetchApi";
import { toast } from "react-toastify";

const PAGE_SIZE = 4;

export default function TestimonialsSection() {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [testimonyText, setTestimonyText] = useState("");
  const [likedIds, setLikedIds] = useState([]);

  const [selectedTestimony, setSelectedTestimony] = useState(null);


  /* ================= FETCH TESTIMONIES ================= */
  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const data = await fetchApi("/api/testimonies/approved");
        setTestimonies(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Impossible de charger les témoignages.");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonies();
  }, []);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(testimonies.length / PAGE_SIZE);

  const displayedTestimonies = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return testimonies.slice(start, start + PAGE_SIZE);
  }, [testimonies, currentPage]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentPage((p) => {
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
        if (i - last === 2) rangeWithDots.push(last + 1);
        else if (i - last > 2) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      last = i;
    }
    return rangeWithDots;
  }

  /* ================= LIKE ================= */
  const handleLike = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    try {
      const data = await fetchApi(`/api/testimonies/likes/${id}`, {
        method: "PUT",
        body: { remove: alreadyLiked },
      });

      setTestimonies((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, likes: data.likes } : t
        )
      );

      setLikedIds((prev) =>
        alreadyLiked ? prev.filter((l) => l !== id) : [...prev, id]
      );

      toast.success("Merci pour votre soutien ❤️");
    } catch {
      toast.error("Erreur lors du like");
    }
  };

  /* ================= SUBMIT TESTIMONY ================= */
  const handleSubmitTestimony = async (e) => {
    e.preventDefault();
    try {
      const newTestimony = await fetchApi("/api/testimonies", {
        method: "POST",
        body: { firstName, testimony: testimonyText },
      });

      setTestimonies((prev) => [newTestimony, ...prev]);
      setShowTestimonyForm(false);
      setFirstName("");
      setTestimonyText("");

      toast.success("Merci pour votre témoignage 🙏");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <section
      id="TestimonialsSection"
      className="w-full bg-[#d8947c]/5 py-20 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 relative">
        <BsQuote className="absolute top-0 right-6 text-[120px] opacity-10" />

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            Témoignages
          </h2>
          <p className="text-gray-600">
            Découvrez comment la prière transforme des vies.<br />
            Votre témoignage peut devenir la réponse à la prière de quelqu’un.
          </p>

          <button
            onClick={() => setShowTestimonyForm(true)}
            className="mt-6 bg-[#d8947c] text-white px-6 py-3 rounded-full font-bold hover:bg-[#c6816a] transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300"
          >
            Partager mon témoignage
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-gray-400">
            Chargement des témoignages…
          </p>
        ) : (
          <>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -120 : 120, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {displayedTestimonies.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white p-8 rounded-2xl shadow-lg flex flex-col justify-between transform transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[#d8947c] mb-4">
                        <div className="flex flex-col leading-tight">
                          <p className="text-sm font-bold text-gray-700">
                            {t.firstName || "Anonyme"}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(t.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <p className="italic text-gray-700 leading-relaxed mb-2 line-clamp-4">
                        “{t.testimony}”
                      </p>

                      {t.testimony.length > 160 && (
                        <button
                          onClick={() => setSelectedTestimony(t)}
                          className="text-sm font-semibold text-[#d8947c] hover:underline"
                        >
                          Lire la suite..
                        </button>
                      )}

                    </div>

                    <div className="flex items-center justify-end mt-auto">
                      <button
                        onClick={() => handleLike(t._id)}
                        className={`flex items-center gap-1 text-sm font-bold ${
                          likedIds.includes(t._id)
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        <FaHeart size={18}/>
                        {t.likes || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* PAGINATION */}
            <div className="mt-12 flex justify-center gap-2 flex-wrap">
              {getPagination(currentPage + 1, totalPages).map((item, i) =>
                item === "..." ? (
                  <span key={i} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => {
                      setDirection(item - 1 > currentPage ? 1 : -1);
                      setCurrentPage(item - 1);
                    }}
                    className={`w-9 h-9 rounded-full font-bold ${
                      currentPage === item - 1
                        ? "bg-[#d8947c] text-white"
                        : "bg-white border text-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL FORM */}
      {showTestimonyForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <form
            onSubmit={handleSubmitTestimony}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold mb-4">
              Partager un témoignage
            </h3>

            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="Votre prénom (optionnel)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <textarea
              rows={4}
              className="w-full border rounded p-2 mb-4"
              placeholder="Votre témoignage…"
              value={testimonyText}
              onChange={(e) => setTestimonyText(e.target.value)}
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowTestimonyForm(false)}
                className="bg-gray-200 rounded-xl px-4 py-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-[#d8947c] text-white px-4 py-2 rounded-xl"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL VOIR PLUS */}

      {selectedTestimony && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full mx-4 rounded-2xl shadow-xl p-6 relative animate-fadeIn">

            {/* Close */}
            <button
              onClick={() => setSelectedTestimony(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex text-[#d8947c] mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              <p className="text-sm font-bold text-gray-700">
                {selectedTestimony.firstName || "Anonyme"}
              </p>
            </div>

            {/* Content */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line italic">
              “{selectedTestimony.testimony}”
            </p>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTestimony(null)}
                className="px-5 py-2 rounded-lg bg-[#d8947c] text-white font-semibold hover:opacity-90 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
