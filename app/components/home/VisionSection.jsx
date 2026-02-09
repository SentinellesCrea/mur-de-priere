"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../ui/button";

const VisionSection = () => {
  const router = useRouter();

  return (
    <section
      id="VisionSection"
      className="w-full p-4 mt-4 mx-auto mb-16"
      aria-labelledby="vision-heading"
    >
      <div className="max-w-[1400px] mx-auto px-6 mt-4">
      {/* Titre centré en haut */}
      <div className="text-center mb-12">
        <h2
          id="vision-heading"
          className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-poppins"
          style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}
        >
          Notre Vision
        </h2>
        <p className="text-gray-500 ">Portons les fardeaux les uns des autres dans la prière.</p>
      </div>


      {/* Contenu en deux colonnes */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Texte à gauche */}
        <div className="md:w-1/2 flex flex-col justify-center">


          <h3
            className="text-3xl lg:text-3xl font-bold text-gray-900 mb-4"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}
          >
            Portons les fardeaux les uns des autres dans la prière.
          </h3>

          <div className="text-lg text-gray-600 mb-4">
            <p className="mb-4">
              <strong>"Portez les fardeaux les uns des autres,</strong> et vous accomplirez ainsi la loi de Christ."
              <span className="text-[#bb7e68]">&nbsp;– Galates 6:2</span>
            </p>

            <p>
              "La prière de la foi sauvera le malade, et le Seigneur le relèvera ; et s'il a commis des péchés, il lui sera pardonné.
              <br />
              Confessez donc vos péchés les uns aux autres, <strong>et priez les uns pour les autres</strong>, afin que vous soyez guéris.
              <strong> La prière fervente du juste a une grande efficacité.</strong>"
              <span className="text-[#bb7e68]">&nbsp;– Jacques 5:15-16</span>
            </p>
          </div>

          <button
            onClick={() => router.push("/apprendre-a-prier")}
            className="
              mt-6
              px-4 py-3
              text-lg font-semibold
              bg-[#d8947c] text-white              
              rounded-full
              transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300
              text-center leading-snug
              mx-auto md:ml-0 md:mr-auto
            "
          >
            Apprendre à prier
          </button>
        </div>

        {/* Image à droite */}
        <div className="hidden md:flex md:w-1/2 justify-end ml-8 transition-transform hover:-translate-y-2 duration-300">
          <Image
            src="/images/mainsenpriere3.jpg"
            alt="Mains jointes en prière - intercession chrétienne en ligne"
            width={400}
            height={400}
            className="w-auto h-[380px] object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
    </section>
  );
};

export default VisionSection;
