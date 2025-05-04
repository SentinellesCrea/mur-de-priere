import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const VolunteerConditionsPage = () => {
  return (
    <div className="bg-white text-gray-800 mt-6">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-6 text-[#d8947c]">Conditions pour devenir bénévole</h1>

        <section className="space-y-4 text-gray-700">
         <p>
            En rejoignant notre équipe de bénévoles, vous vous engagez à être un acteur de paix et d’espérance dans
            le Royaume de Dieu. Ce service est avant tout un ministère de cœur, porté par la foi, l’amour de Jésus,
            et l’engagement envers les autres.
          </p>


          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Être un acteur pour Christ :</strong> Servir avec foi, dans l’amour de Jésus, avec le désir d’apporter la lumière là où il y a de la détresse.</li>
            <li><strong>Confidentialité :</strong> Les informations reçues doivent rester strictement privées.</li>
            <li><strong>Écoute active :</strong> Être à l’écoute avec compassion, sans jugement.</li>
            <li><strong>Respect de la foi :</strong> Agir dans un esprit d’amour, sans imposer ses convictions.</li>
            <li><strong>Engagement personnel :</strong> Être disponible pour prier fidèlement pour les sujets confiés.</li>
            <li><strong>Aucune rémunération :</strong> Ce service est entièrement bénévole et non rémunéré.</li>
            <li><strong>Comportement exemplaire :</strong> Avoir une attitude respectueuse et digne en toute circonstance.</li>
          </ul>

          <p>
            En cochant la case lors de votre inscription, vous confirmez avoir lu et accepté ces
            conditions. Merci de faire partie de cette œuvre spirituelle au service de ceux qui en ont besoin.
          </p>

          <div className="mt-12 border-t border-b pt-6 text-center text-gray-600 italic">
            <p className="text-lg max-w-xl mx-auto">
              "Comme de bons dispensateurs des diverses grâces de Dieu, que chacun de vous mette au service des autres le don qu’il a reçu."  
            </p>
            <p className="mt-2 text-[#d8947c]">— 1 Pierre 4:10</p>
          </div>


          <p className="mt-6">
            <Link href="/volunteers/signup" className="text-[#d8947c] hover:underline">
              ← Revenir au formulaire d’inscription
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VolunteerConditionsPage;
