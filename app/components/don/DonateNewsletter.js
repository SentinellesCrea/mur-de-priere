// 📁 /app/components/don/DonateNewsletter.js
"use client";

export default function DonateNewsletter() {
  return (
    <section className="bg-[#5F37EF] px-6 py-16 text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-lg mb-6">
            Inscrivez-vous à notre newsletter pour suivre nos actions et découvrir comment votre soutien fait la différence.
          </p>
          <p className="text-sm opacity-80">
            Nous respectons votre vie privée. Désabonnement possible à tout moment.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Votre adresse email"
            className="w-full sm:w-auto px-4 py-3 rounded-md text-gray-800"
            required
          />
          <button
            type="submit"
            className="bg-white text-[#5F37EF] font-semibold px-6 py-3 rounded-md shadow hover:bg-gray-100"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  );
}