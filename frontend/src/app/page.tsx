import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCards from "@/components/landing/FeatureCards";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustSection from "@/components/landing/TrustSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-950 relative">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <HowItWorks />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
