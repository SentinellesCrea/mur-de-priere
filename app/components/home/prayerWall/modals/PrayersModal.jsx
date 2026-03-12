"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

export default function PrayersModal({
  type,
  isOpen,
  onClose,
  prayer,
  comments,
  authorName,
  commentText,
  setAuthorName,
  setCommentText,
  onSubmitComment,
}) {
  if (!isOpen) return null;

  /* ================= MODAL PRIÈRE ================= */

  if (type === "prayer") {
    const isAnonymous = prayer?.name === "Anonyme";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
        <div className="bg-white max-w-lg w-full mx-4 rounded-2xl shadow-xl p-6 relative animate-fadeIn">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>

          <div className="flex gap-3 items-center mb-4">
            {isAnonymous ? (
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                ?
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

          <h3 className="text-lg font-bold mb-1">{prayer.category}</h3>

          <p className="text-xs text-gray-400 mb-4">
            Publié le{" "}
            {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
          </p>

          <p className="text-gray-700 whitespace-pre-line">
            {prayer.prayerRequest}
          </p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-[#d8947c] text-white font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= MODAL COMMENTAIRE ================= */

  if (type === "comment-form") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">

          <h3 className="text-lg font-bold mb-2">
            Ajouter un commentaire
          </h3>

          <input
            type="text"
            placeholder="Votre prénom ou pseudo (optionnel)"
            className="w-full p-2 border rounded text-sm mb-2"
            value={authorName || ""}
            onChange={(e) => setAuthorName(e.target.value)}
          />

          <textarea
            rows={3}
            placeholder="Écris un mot d'encouragement..."
            className="w-full p-2 border rounded text-sm mb-4"
            value={commentText || ""}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="text-sm text-gray-700 bg-gray-100 px-4 py-1 rounded-xl"
            >
              Annuler
            </button>

            <button
              onClick={onSubmitComment}
              className="bg-[#d4967d] text-white px-4 py-1 text-sm rounded-xl"
            >
              Envoyer
            </button>
          </div>

        </div>
      </div>
    );
  }

  {/* ================= MODAL LISTE COMMENTAIRES ================= */}

  if (type === "comments-list") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">

        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="p-6 border-b flex justify-between items-center">

            <h3 className="font-bold text-lg">
              Commentaires d'encouragement
            </h3>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>

          </div>

          {/* CONTENU SCROLL */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">

            {comments?.length > 0 ? (

              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                />
              ))

            ) : (

              <p className="text-sm italic text-gray-500">
                Aucun commentaire pour cette prière pour le moment.
              </p>

            )}

          </div>

          {/* FOOTER */}
          <div className="p-4 border-t flex justify-end">

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#d8947c] text-white font-semibold hover:opacity-90 transition"
            >
              Fermer
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* ================= MODAL EDIT COMMENT ================= */

    if (type === "edit-comment") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">

            <h3 className="text-lg font-bold mb-4">
              Modifier le commentaire
            </h3>

            <textarea
              rows={3}
              placeholder="Modifier votre commentaire..."
              className="w-full p-2 border rounded text-sm mb-4"
              value={commentText || ""}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="text-sm text-gray-700 bg-gray-100 px-4 py-1 rounded-xl hover:bg-gray-200"
              >
                Annuler
              </button>

              <button
                onClick={onSubmitComment}
                className="bg-[#d4967d] text-white px-4 py-1 text-sm rounded-xl hover:bg-[#c1836a]"
              >
                Enregistrer
              </button>
            </div>

          </div>
        </div>
      );
    }

  return null;
}