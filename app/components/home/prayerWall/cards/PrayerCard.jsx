"use client";

import { AiOutlineComment } from "react-icons/ai";
import { FaPrayingHands, FaUserSlash } from "react-icons/fa";
import CommentList from "../comments/CommentList";

export default function PrayerCard({
  prayer,
  comments,
  commentsCount,
  active,
  onToggleComments,
  onPray,
}) {

  const isAnonymous = prayer.name === "Anonyme";

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">

      {/* HEADER */}
      <div className="flex justify-between">

        <div className="flex gap-3">

          {isAnonymous ? (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FaUserSlash />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#d8947c]/10 flex items-center justify-center">
              {prayer.name?.charAt(0)}
            </div>
          )}

          <div>
            <p className="font-bold text-sm">
              {isAnonymous ? "Anonyme" : prayer.name}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}
            </p>
          </div>

        </div>

        <span className="flex items-center gap-2 text-xs text-[#d8947c]">
          <FaPrayingHands />
          {prayer.nombrePriants}
        </span>

      </div>

      {/* CONTENU */}

      <h4 className="font-bold mt-3">{prayer.category}</h4>

      <p className="text-sm text-gray-600 line-clamp-3">
        {prayer.prayerRequest}
      </p>

      {/* FOOTER */}

      <div className="flex justify-between mt-3">

        <button
          onClick={() => onToggleComments(prayer._id)}
          className="relative text-[#d8947c]"
        >
          <AiOutlineComment size={22} />

          {commentsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
              {commentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onPray(prayer._id)}
          className="bg-[#d8947c] text-white text-sm px-3 py-1 rounded"
        >
          Je prie
        </button>

      </div>

      {active && (
        <CommentList comments={comments} />
      )}

    </div>
  );
}