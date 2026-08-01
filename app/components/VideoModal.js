"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { extractYouTubeId } from "@/lib/extractYouTubeId";

export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, video]);

  if (!video) return null;
  const videoId = extractYouTubeId(video.url);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172033]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white text-lg text-gray-700 shadow transition hover:bg-[#f0e7df] hover:text-[#8b1e3f] sm:right-3 sm:top-3"
          aria-label="Fermer la vidéo"
        >
          <FiX aria-hidden="true" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          )}
        </div>
        <h2
          id="video-modal-title"
          className="mt-4 pr-10 text-lg font-bold text-[#2f2a26]"
        >
          {video.title}
        </h2>
      </div>
    </div>
  );
}
