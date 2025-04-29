"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AnimatedSection = ({ children, variants, className }) => {
  const { ref, inView } = useInView({
    threshold: 0.2, triggerOnce: false,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"} // ✨ toggle fluide
      variants={variants}
      transition={{ duration: 1.5, ease: "easeInOut" }} // ⏳ ralentit le flip
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
