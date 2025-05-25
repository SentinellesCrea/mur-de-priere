"use client";

import { extractYouTubeId } from "@/lib/extractYouTubeId";

export default function VideoModal({ video, onClose }) {
  if (!video) return null;

  const videoId = extractYouTubeId(video.url);

  return (
    <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl scale-105 transition-transform duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-semibold text-lg"
        >
          ✕
        </button>

        <div className="aspect-video w-full rounded-md overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <p className="mt-3 font-semibold text-center text-gray-800">{video.title}</p>
      </div>
    </div>
  );
}
