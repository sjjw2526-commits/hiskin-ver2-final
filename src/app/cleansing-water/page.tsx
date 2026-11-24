import type { Metadata } from "next";
import { IntroProvider } from "@/components/IntroContext";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import CleansingDetail from "@/components/CleansingDetail";
import CleansingFormula from "@/components/CleansingFormula";
import CleansingArchive from "@/components/CleansingArchive";
import InquiryForm from "@/components/InquiryForm";
import Footer from "@/components/Footer";

const DESCRIPTION =
  "Micellar cleansing water with green tea extract, seawater and 4% glycerin. B2B inquiries for overseas distributors, wholesalers, and clinics.";

export const metadata: Metadata = {
  title: "HISKIN — Micellar Cleansing Water",
  description: DESCRIPTION,
  alternates: { canonical: "/cleansing-water" },
  openGraph: {
    url: "/cleansing-water",
    siteName: "HISKIN",
    title: "HISKIN — Micellar Cleansing Water",
    description: DESCRIPTION,
    type: "website",
    // Still the brand image the home page shares; swap in a bottle card
    // (1200×630) once the product is photographed.
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "HISKIN" }],
  },
};

/**
 * The cleansing water's own page, kept short on purpose and built from the
 * suncream page's three product blocks: the product opener with its spec
 * column, the formula, and the archive of product cuts. Manufacturing is
 * left to the home page so its factory photographs are not shown twice.
 * Everything inside .theme-cleanse takes the green accent; the navbar and
 * footer are chrome and stay neutral.
 */
export default function CleansingWaterPage() {
  return (
    <IntroProvider>
      <SmoothScroll>
        <Navbar page="cleansing" />
        <main className="theme-cleanse">
          <CleansingDetail />
          <CleansingFormula />
          <CleansingArchive />
          <InquiryForm product="cleansing" />
        </main>
        <Footer page="cleansing" />
      </SmoothScroll>
    </IntroProvider>
  );
}
