export default function VideoBlock({ url, title }) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      {title && (
        <h3 className="text-2xl font-bold mb-6 text-center">
          {title}
        </h3>
      )}

      <div className="aspect-video rounded-xl overflow-hidden shadow-md">
        <iframe
          src={url}
          title={title || "Vidéo"}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    </section>
  );
}
