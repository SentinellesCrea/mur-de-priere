"use client";

import { extractYouTubeId } from "@/lib/extractYouTubeId";

export default function VideoCard({ video, onTextClick, onVideoClick }) {
  const videoId = extractYouTubeId(video.url);
  const isLong = video.message && video.message.length > 50;
  const truncatedMessage = isLong ? video.message.slice(0, 50) + "..." : video.message;

  return (
    <div className="border rounded-lg overflow-hidden shadow p-3 flex flex-col md:flex-row gap-4 items-start">
      {/* Texte à gauche */}
      <div className="md:w-2/3">
        <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
        <p className="text-gray-700 text-sm">
          {truncatedMessage}
          {isLong && (
            <button
              className="ml-2 text-[#bb7e68] underline text-sm"
              onClick={() => onTextClick(video.message)}
            >
              Lire plus
            </button>
          )}
        </p>
      </div>

      {/* Vidéo à droite */}
      <div className="md:w-1/3 w-full aspect-video">
        {videoId && (
          <div onClick={() => onVideoClick(video)} className="cursor-pointer w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={video.title}
              allowFullScreen
              className="w-full h-full rounded pointer-events-none"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
