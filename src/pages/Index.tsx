import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import SupportedChains from "@/components/landing/SupportedChains";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import BonusBanner from "@/components/promotional/BonusBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <BonusBanner trigger="session" />
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SupportedChains />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
