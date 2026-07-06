import { safePublicImageUrl } from "@/lib/publicSafeUrls";

export default function ImageBlock({
  src,
  caption,
  imageSize = "medium",
  imageShape = "rounded",
}) {
  const safeSrc = safePublicImageUrl(src);
  const sizeClass = {
    small: "max-w-2xl",
    medium: "max-w-4xl",
    wide: "max-w-6xl",
    full: "max-w-none",
  }[imageSize] || "max-w-4xl";
  const shapeClass = {
    soft: "rounded-2xl",
    rounded: "rounded-[2rem]",
    square: "rounded-none",
  }[imageShape] || "rounded-[2rem]";

  return (
    <section className={`${sizeClass} mx-auto px-6 py-12 text-center`}>
      <img
        src={safeSrc}
        alt={caption || ""}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${shapeClass} shadow-md mx-auto`}
      />
      {caption && (
        <p className="text-sm text-gray-500 mt-3 italic">
          {caption}
        </p>
      )}
    </section>
  );
}
