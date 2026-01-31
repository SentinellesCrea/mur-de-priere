export default function VerseBlock({ verse, reference }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <blockquote className="border-l-4 border-[#d8947c] pl-6 italic text-gray-700">
        <p className="mb-3">“{verse}”</p>
        {reference && (
          <footer className="text-sm text-[#d8947c] font-semibold">
            {reference}
          </footer>
        )}
      </blockquote>
    </section>
  );
}
