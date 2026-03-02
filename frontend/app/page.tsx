import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Challenges from "@/components/Challenges";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import BackToTop from "@/components/BackToTop";
import RegistrationSuccessAlert from "@/components/RegistrationSuccessAlert";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <RegistrationSuccessAlert />
      <FloatingCircles />
      <Hero />
      <Challenges />
      <Features />
      <HowItWorks />
      <Benefits />
      <Footer />
      <BackToTop />
    </>
  );
}
