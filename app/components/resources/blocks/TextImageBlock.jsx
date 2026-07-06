import { safePublicImageUrl } from "@/lib/publicSafeUrls";

export default function TextImageBlock({
  title,
  text,
  image,
  src,
  position,
  imagePosition = "left", // "left" | "right"
  imageShape = "rounded",
  imageSize = "medium",
  background = "none",
}) {
  const imageSource = image || src;
  const safeImageSource = imageSource ? safePublicImageUrl(imageSource) : "";
  const isRight = (position || imagePosition) === "right";
  const imageHeight = {
    compact: "h-[240px]",
    medium: "h-[320px]",
    tall: "h-[440px]",
  }[imageSize] || "h-[320px]";
  const imageRadius = {
    soft: "rounded-2xl",
    rounded: "rounded-[2rem]",
    square: "rounded-none",
  }[imageShape] || "rounded-[2rem]";
  const backgroundClass = {
    none: "",
    warm: "bg-[#FFF8F1] rounded-[2rem] p-6 sm:p-8",
    calm: "bg-[#F4F1FF] rounded-[2rem] p-6 sm:p-8",
  }[background] || "";

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div
        className={`
          grid md:grid-cols-2 gap-10 items-center ${backgroundClass}
        `}
      >
        {/* IMAGE */}
        {safeImageSource ? (
          <div
            className={`
              w-full h-full
              ${isRight ? "md:order-2" : "md:order-1"}
            `}
          >
            <div
              className={`w-full ${imageHeight} ${imageRadius} shadow-md bg-cover bg-center`}
              style={{
                backgroundImage: `url("${safeImageSource}")`,
              }}
            />
          </div>
        ) : (
          <div
            className={`
              w-full ${imageHeight} ${imageRadius} bg-gray-100 flex items-center justify-center text-gray-400 text-sm
              ${isRight ? "md:order-2" : "md:order-1"}
            `}
          >
            Aucune image
          </div>
        )}

        {/* TEXTE */}
        <div className={`${isRight ? "md:order-1" : "md:order-2"}`}>
          {title && (
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {title}
            </h3>
          )}

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}
