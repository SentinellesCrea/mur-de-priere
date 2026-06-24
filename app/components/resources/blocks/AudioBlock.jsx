export default function AudioBlock({ title, audioUrl, url }) {
  const source = audioUrl || url;
  return (
    <section className="max-w-3xl mx-auto px-6 py-12 text-center">
      {title && (
        <h3 className="text-xl font-bold mb-4">
          {title}
        </h3>
      )}

      <audio
        controls
        className="w-full"
        src={source}
      >
        Votre navigateur ne supporte pas l’audio.
      </audio>
    </section>
  );
}
