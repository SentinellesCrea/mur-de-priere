
import Image from "next/image";


const VisionSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-6xl mx-auto">
      {/* Texte à gauche */}
      <div className="md:w-1/2">
        <p className="text-[#bb7e68] text-sm font-bold uppercase mb-2">
          Manifestons notre amour par la prière.
        </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}>
            Portons les fardeaux les uns des autres.
          </h2><br/>
          <div className="text-lg max-w-6xl text-align:justify">
              <p className="max-w-6xl text-lg text-gray-600 text-align:justify">
                "<b>Portez les fardeaux les uns des autres,</b> et vous accomplirez ainsi la loi de Christ."
                <a className="text-1xl text-[#bb7e68]">
                  &nbsp;Galates 6:2
              </a>
              </p>
          </div>

          <p className="max-w-6xl text-lg text-gray-600 text-align:justify">
            "la prière de la foi sauvera le malade, et le Seigneur le relèvera; et s'il a commis des péchés, il lui sera pardonné.<br/> 
            Confessez donc vos péchés les uns aux autres, <b>et priez les uns pour les autres,</b> afin que vous soyez guéris. 
            <b>&nbsp;La prière fervente du juste a une grande efficace.</b>"
              <a className="text-1xl text-[#bb7e68]">
                &nbsp;Jacques 5:15-16
              </a>
          </p>
      </div>

      {/* Image à droite */}
        <div className="md:w-1/2 w-full flex justify-center md:justify-end mt-8 ml-4 md:mt-0 ">
          <Image 
            src="/images/mainsenpriere3.jpg"
            alt="Praying hands"
            width={400} // Pour le rendu optimisé sur Next.js (mais pas strict en style)
            height={400}
            className="w-auto h-[260px] md:h-[380px] object-contain rounded-xl "
          />
        </div>
    </section>
  );
};

export default VisionSection;

