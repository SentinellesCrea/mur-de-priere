export default function TextImageBlock({
  title,
  text,
  image,
  imagePosition = "left", // "left" | "right"
}) {
  const isRight = imagePosition === "right";

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div
        className={`
          grid md:grid-cols-2 gap-10 items-center
        `}
      >
        {/* IMAGE */}
        {image ? (
          <div
            className={`
              w-full h-full
              ${isRight ? "md:order-2" : "md:order-1"}
            `}
          >
            <div
              className="w-full h-[320px] rounded-xl shadow-md bg-cover bg-center"
              style={{
                backgroundImage: `url("${image}")`,
              }}
            />
          </div>
        ) : (
          <div
            className={`
              w-full h-[320px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm
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
