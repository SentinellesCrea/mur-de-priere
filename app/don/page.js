"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

import DonateHero from "@/app/components/don/DonateHero";
import DonateMission from "@/app/components/don/DonateMission";
import DonateContent from "@/app/components/don/DonateContent";
import DonateImpact from "@/app/components/don/DonateImpact";
import CallToActionDon from "@/app/components/don/CallToActionDon";
import TestimonialsSection from "@/app/components/don/TestimonialsSection";
import DonateFAQ from "@/app/components/don/DonateFAQ";
import DonateNewsletter from "@/app/components/don/DonateNewsletter";
import DonateThanks from "@/app/components/don/DonateThanks";

export default function DonatePage() {
  return (
    <div className="bg-white text-gray-900 flex flex-col">
      <Navbar />

      <DonateHero />
      <DonateMission />
      <CallToActionDon />
      <TestimonialsSection />
      <DonateContent />
      <DonateFAQ />
      <DonateImpact />
      <DonateNewsletter />
      <DonateThanks />

      <Footer />
    </div>
  );
}
