"use client";

import { FiBookOpen, FiPlay } from "react-icons/fi";
import { extractYouTubeId } from "@/lib/extractYouTubeId";

export default function VideoCard({ video, onTextClick, onVideoClick }) {
  const videoId = extractYouTubeId(video.url);
  const isLong = video.message && video.message.length > 125;
  const truncatedMessage = isLong
    ? `${video.message.slice(0, 125).trim()}…`
    : video.message;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white transition hover:-translate-y-1 hover:shadow-xl">
      {videoId ? (
        <button
          type="button"
          onClick={() => onVideoClick(video)}
          className="relative aspect-video w-full overflow-hidden bg-[#253047] text-white"
          aria-label={`Regarder la vidéo : ${video.title}`}
        >
          <span
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{
              backgroundImage: `linear-gradient(rgba(37,48,71,.08), rgba(37,48,71,.45)), url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`,
            }}
            aria-hidden="true"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/95 pl-1 text-xl text-[#8b1e3f] shadow-lg transition group-hover:scale-110">
              <FiPlay aria-hidden="true" />
            </span>
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-[#253047]/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            Regarder
          </span>
        </button>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[#f0e7df] text-[#8b1e3f]">
          <FiBookOpen className="text-3xl" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">{video.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
          {truncatedMessage}
        </p>
        {isLong && (
          <button
            type="button"
            className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#8b1e3f] transition hover:text-[#d8947c]"
            onClick={() => onTextClick(video)}
          >
            <FiBookOpen aria-hidden="true" />
            Lire l’enseignement
          </button>
        )}
      </div>
    </article>
  );
}
