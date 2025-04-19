"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
  

const testimonials = [
  {
    text: "Grâce à cette plateforme, j'ai trouvé un soutien incroyable dans la prière.",
    author: "Marie",
  },
  {
    text: "J’ai ressenti la puissance de la prière collective. Merci !",
    author: "Jean",
  },
  {
    text: "Une communauté bienveillante qui m'aide chaque jour.",
    author: "Paul",
  },
  {
    text: "Une communauté bienveillante qui m'aide chaque jour.",
    author: "Mick",
  },
];

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    );

    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        delay: 0.5,
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-10 px-6 mt-6 bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-12">Témoignages</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
            className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300"
          >
            <p className="text-gray-700">{testimonial.text}</p>
            <span className="block mt-4 text-sm font-semibold text-[#E9967A]">
              - {testimonial.author}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-5">
          <button onClick={() => router.push("/temoignages")}
            type="submit"
            className="bg-[#E9967A] text-white p-3 rounded-lg font-semibold hover:bg-[#FA8072] transition"
          >
            Voir tous les témoignages
          </button>
      </div>

    </section>
  );
};

export default TestimonialsSection;
