"use client";

import { useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HeroSection from "./components/home/HeroSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import PrayerWallSection from "./components/home/PrayerWallSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import ResourcesSection from "./components/home/ResourcesSection";
import VisionSection from "./components/home/VisionSection";
import FindChurchSection from "./components/home/FindChurchSection";

export default function HomePage() {
  const [prayers, setPrayers] = useState([]);

  return (
    <>
      <Navbar />

      <main className="w-full min-h-screen">

        <HeroSection
          onNewPrayer={(newPrayer) => {
            setPrayers((prev) => [newPrayer, ...prev]);
          }}
        />

        <HowItWorksSection />

        <PrayerWallSection
          prayers={prayers}
          setPrayers={setPrayers}
        />

        <TestimonialsSection />
        <VisionSection />
        <FindChurchSection />
        <ResourcesSection />

      </main>

      <Footer />
    </>
  );
}
