import { IntroProvider } from "@/components/IntroContext";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Philosophy from "@/components/Philosophy";
import VideoGrid from "@/components/VideoGrid";
import ProductDetail from "@/components/ProductDetail";
import ScienceAccordion from "@/components/ScienceAccordion";
import ArchiveGallery from "@/components/ArchiveGallery";
import Manufacturing from "@/components/Manufacturing";
import ClinicalData from "@/components/ClinicalData";
import Certifications from "@/components/Certifications";
import InquiryForm from "@/components/InquiryForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <IntroProvider>
      <SmoothScroll>
        <Preloader />
        <Navbar />
        <main>
          <Hero />
          <Statement />
          <Philosophy />
          <VideoGrid />
          <ProductDetail />
          <ScienceAccordion />
          <ArchiveGallery />
          <Manufacturing />
          <ClinicalData />
          <Certifications />
          <InquiryForm />
        </main>
        <Footer />
      </SmoothScroll>
    </IntroProvider>
  );
}
