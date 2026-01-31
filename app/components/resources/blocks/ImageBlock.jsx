export default function ImageBlock({ src, caption }) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 text-center">
      <img
        src={src}
        alt={caption || ""}
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
