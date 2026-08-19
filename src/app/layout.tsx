import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HISKIN — Daily Suncream Protect",
  description:
    "One Step. Zero Effort. SPF 50+ PA++++ 3-in-1 daily tone-up suncream. B2B inquiries for overseas distributors, wholesalers, and clinics.",
  openGraph: {
    title: "HISKIN — Daily Suncream Protect",
    description:
      "One Step. Zero Effort. SPF 50+ PA++++ 3-in-1 daily tone-up suncream.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="is-loading">
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
