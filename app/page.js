"use client";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import VisionSection from "./components/VisionSection";
import PrayerRequestForm from "./components/PrayerRequestForm";
import PrayTabsSection from "./components/PrayTabsSection";
import Footer from "./components/Footer";
import AnimatedSection from "./components/AnimatedSection";
import {
  slideUpVariants,
  fadeUpVariants,
  slideFadeLeftVariants,
} from "../lib/animations"; // adapte si nécessaire

const HomePage = () => {
  return (
    <div className="bg-white text-gray-900">
      <Navbar />

       <HeroSection />

      <AnimatedSection variants={fadeUpVariants} className="overflow-hidden">
        <VisionSection />
      </AnimatedSection>

      <AnimatedSection variants={slideFadeLeftVariants}>
        <PrayerRequestForm />
      </AnimatedSection>

      <AnimatedSection variants={fadeUpVariants}>
        <PrayTabsSection />
      </AnimatedSection>
     
        <Footer />
    </div>
  );
};

export default HomePage;
