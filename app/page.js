"use client";

import { useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HeroSection from "./components/home/HeroSection";
import PrayerWallSection from "./components/home/PrayerWallSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import ResourcesSection from "./components/home/ResourcesSection";
import VisionSection from "./components/home/VisionSection";

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

        <PrayerWallSection
          prayers={prayers}
          setPrayers={setPrayers}
        />

        <TestimonialsSection />
        <VisionSection />
        <ResourcesSection />

      </main>

      <Footer />
    </>
  );
}