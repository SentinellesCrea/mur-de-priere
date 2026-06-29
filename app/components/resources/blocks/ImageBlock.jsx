import { safePublicImageUrl } from "@/lib/publicSafeUrls";

export default function ImageBlock({ src, caption }) {
  const safeSrc = safePublicImageUrl(src);

  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-center">
      <img
        src={safeSrc}
        alt={caption || ""}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="rounded-xl shadow-md mx-auto"
      />
      {caption && (
        <p className="text-sm text-gray-500 mt-3 italic">
          {caption}
        </p>
      )}
    </section>
  );
}
