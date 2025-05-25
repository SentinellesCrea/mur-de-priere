import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "./ui/button";

const VisionSection = () => {
  const router = useRouter();

  return (
    <section
      className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-6xl mx-auto"
      aria-labelledby="vision-heading"
    >
      {/* Texte à gauche */}
      <div className="md:w-1/2 flex flex-col justify-center">
        <p className="text-[#bb7e68] text-sm font-bold uppercase mb-2">
          Une plateforme chrétienne dédiée à l’intercession.
        </p>

        <h2
          id="vision-heading"
          className="text-4xl lg:text-4xl font-bold text-gray-900 mb-4"
          style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}
        >
          Portons les fardeaux les uns des autres dans la prière.
        </h2>

        <div className="text-lg text-gray-600 mb-4">
          <p className="mb-4">
            <b>"Portez les fardeaux les uns des autres,</b> et vous accomplirez ainsi la loi de Christ."
            <a className="cursor-pointer text-[#bb7e68]">&nbsp;Galates 6:2</a>
          </p>

          <p>
            "La prière de la foi sauvera le malade, et le Seigneur le relèvera ; et s'il a commis des péchés, il lui sera pardonné.
            <br />
            Confessez donc vos péchés les uns aux autres, <b>et priez les uns pour les autres</b>, afin que vous soyez guéris.
            <b> La prière fervente du juste a une grande efficacité.</b>"
            <a className="cursor-pointer text-[#bb7e68]">&nbsp;Jacques 5:15-16</a>
          </p>
        </div>

        {/* ✅ Nouveau bouton vers page d'enseignement */}
        <Button
          onClick={() => router.push("/apprendre-a-prier")}
          className="mt-6 text-lg font-semibold transform hover:-translate-y-2 duration-300 w-fit"
        >
          Apprendre à prier avec des enseignements concrets
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
    </section>
  );
};

export default VisionSection;
