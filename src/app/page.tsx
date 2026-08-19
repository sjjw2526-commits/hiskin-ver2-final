import { IntroProvider } from "@/components/IntroContext";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import VideoGrid from "@/components/VideoGrid";
import Philosophy from "@/components/Philosophy";
import ProductDetail from "@/components/ProductDetail";
import ScienceAccordion from "@/components/ScienceAccordion";
import ArchiveGallery from "@/components/ArchiveGallery";
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
          <VideoGrid />
          <Philosophy />
          <ProductDetail />
          <ScienceAccordion />
          <ArchiveGallery />
          <InquiryForm />
        </main>
        <Footer />
      </SmoothScroll>
    </IntroProvider>
  );
}
