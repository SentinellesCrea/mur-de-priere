import { safePublicVideoUrl } from "@/lib/publicSafeUrls";

export default function VideoBlock({ url, title }) {
  const safeUrl = safePublicVideoUrl(url);

  if (!safeUrl) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      {title && (
        <h3 className="text-2xl font-bold mb-6 text-center">
          {title}
        </h3>
      )}

      <div className="aspect-video rounded-xl overflow-hidden shadow-md">
        <iframe
          src={safeUrl}
          title={title || "Vidéo"}
          className="w-full h-full"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
        />
      </div>
    </section>
  );
}
