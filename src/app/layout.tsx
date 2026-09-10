import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Hangul. Inter and Plus Jakarta carry no Korean at all, so before this the
 * Korean half of every line fell through to whatever the reader's machine
 * offered — Noto Sans KR here, Malgun Gothic on a machine without it, and
 * something else again on a Mac. Pretendard is set tighter and more evenly
 * than any of those and sits properly beside Inter.
 *
 * Subset build, and only the three weights the page's Korean actually uses
 * (400 carries 84% of it, 500 and 600 the rest): 264KB each rather than the
 * 748KB of the full cut, and the whole page is under a megabyte of assets.
 * Self-hosted rather than pulled from a CDN so it cannot fail separately
 * from the deploy.
 */
const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Regular.subset.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Pretendard-Medium.subset.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Pretendard-SemiBold.subset.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

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
  // The same page answers at hiskin.netlify.app and www.hiskinlab.com. The
  // canonical tells search engines which one is the real address, so the two
  // are not counted as duplicate content. metadataBase also turns relative
  // Open Graph URLs into the absolute ones link previews require.
  metadataBase: new URL("https://www.hiskinlab.com"),
  alternates: { canonical: "/" },
  title: "HISKIN — Daily Suncream Protect",
  description:
    "One Step. Zero Effort. SPF 50+ PA++++ 3-in-1 daily tone-up suncream. B2B inquiries for overseas distributors, wholesalers, and clinics.",
  openGraph: {
    url: "/",
    siteName: "HISKIN",
    title: "HISKIN — Daily Suncream Protect",
    description:
      "One Step. Zero Effort. SPF 50+ PA++++ 3-in-1 daily tone-up suncream.",
    type: "website",
    // The link preview shown in KakaoTalk, WhatsApp, LinkedIn and mail.
    // 1200×630: img-03 (the Philosophy bleed) with the wordmark set in the
    // open right half, clear of the face.
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HISKIN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="is-loading">
      <head>
        {/*
          A reload should replay the page from the top, not drop the reader
          back where they were. This has to run before the first paint —
          browsers restore the old offset that early, so anything waiting on
          React has already lost the race.

          A hash is an explicit request for a section, so that one is left
          alone: /#science still lands on Science.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if('scrollRestoration' in history)history.scrollRestoration='manual';if(!location.hash)window.scrollTo(0,0);}catch(e){}})();",
          }}
        />
      </head>
      <body className={`${inter.variable} ${pretendard.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
