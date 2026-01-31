export default function CalloutBlock({ title, text }) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-[#d8947c]/10 border-l-4 border-[#d8947c] p-6 rounded-xl">
        {title && (
          <h4 className="font-bold text-lg mb-2 text-gray-900">
            {title}
          </h4>
        )}
        <p className="text-gray-700 leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}
