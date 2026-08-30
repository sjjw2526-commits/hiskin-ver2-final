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
  title: "HISKIN — Less Cover. More Skin.",
  description:
    "파운데이션 없이 자연스럽고 맑은 피부 표현을 완성하는 데일리 선크림. SPF 50+ / PA++++. 해외 유통·도매·클리닉·에스테틱 파트너를 위한 HISKIN B2B 브랜드 사이트.",
  openGraph: {
    title: "HISKIN — Less Cover. More Skin.",
    description: "Foundation-free daily suncream. SPF 50+ / PA++++.",
    type: "website",
  },
  twitter: {
    card: "summary",
    description: "Foundation-free daily suncream. SPF 50+ / PA++++.",
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
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
