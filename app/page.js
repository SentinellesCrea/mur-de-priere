"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HeroSection from "./components/home/HeroSection";
import PrayerWallSection from "./components/home/PrayerWallSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import ResourcesSection from "./components/home/ResourcesSection";
import SectionDivider from "./components/home/SectionDivider";
import VisionSection from "./components/home/VisionSection";

export default function HomePage() { 

  return (
    <>
      <Navbar />

      <main className="w-full min-h-screen">

        <HeroSection /> 

        <PrayerWallSection />

        <TestimonialsSection />

        <VisionSection />

        <ResourcesSection />

      </main>

      <Footer />
    </>
  );
}
