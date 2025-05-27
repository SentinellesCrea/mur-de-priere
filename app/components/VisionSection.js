"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "./ui/button";

const VisionSection = () => {
  const router = useRouter();

  return (
    <section
      id="vision"
      className="px-4 py-20 max-w-7xl mx-auto"
      aria-labelledby="vision-heading"
    >
      {/* Titre centré en haut */}
      <div className="text-center mb-12">
        <h2
          id="vision-heading"
          className="text-4xl sm:text-5xl font-bold text-gray-900 font-poppins"
          style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}
        >
          Notre Vision
        </h2>
      </div>

      {/* Contenu en deux colonnes */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Texte à gauche */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <p className="text-[#bb7e68] text-sm font-bold uppercase mb-2">
            Une plateforme chrétienne dédiée à l’intercession.
          </p>

          <h3
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
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

          <Button
            onClick={() => router.push("/apprendre-a-prier")}
            className="mt-6 text-lg font-semibold transform hover:-translate-y-2 duration-300 w-fit text-center leading-snug mx-auto md:ml-0 md:mr-auto"
          >
            Apprendre à prier
            <br />
            <span className="text-base text-sm font-normal text-white">
              avec des enseignements concrets
            </span>
          </Button>

        </div>

        {/* Image à droite */}
        <div className="md:w-1/2 w-full flex justify-center md:justify-end mt-8 md:mt-0 md:ml-8 transition-transform hover:-translate-y-2 duration-300">
          <Image
            src="/images/mainsenpriere3.jpg"
            alt="Mains jointes en prière - intercession chrétienne en ligne"
            width={400}
            height={400}
            className="w-auto h-[260px] md:h-[380px] object-contain rounded-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
