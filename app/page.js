import Navbar from "./components/Navbar";
import HeroSection from './components/HeroSection';
import VisionSection from './components/VisionSection';
import PrayerRequestForm from "./components/PrayerRequestForm"; // 🔹 Importation
import PrayTabsSection from './components/PrayTabsSection';
import Footer from "./components/Footer";


const HomePage = () => {
  return (
    <div className="bg-white text-gray-900">
      <Navbar />
      <HeroSection />
      <VisionSection />
      <PrayerRequestForm />
      <PrayTabsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
