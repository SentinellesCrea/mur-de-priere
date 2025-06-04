// app/components/CallToActionDon.js
'use client';

export default function CallToActionDon() {
  return (
    <section className="w-full px-6 py-16 bg-[#534CF5]">
      <div className="bg-white text-gray-800 rounded-3xl px-10 py-14 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold mb-4">Chaque don compte</h3>
          <p className="text-lg leading-relaxed">
            Votre générosité, quelle que soit son ampleur, <br />
            contribue à notre mission.
            Ensemble, nous pouvons faire la différence.
          </p>
        </div>

        <a
          href="/don"
          className="bg-[#534CF5] text-white font-semibold whitespace-nowrap px-6 py-4 rounded-xl text-lg shadow-md hover:scale-105 transition"
        >
          Faire un don maintenant
        </a>
      </div>
    </section>
  );
}
