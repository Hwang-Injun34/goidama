import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
// 💡 감성적인 로고를 위한 폰트(Gowun Batang) 추가
import { Gowun_Batang, Noto_Sans_KR } from "next/font/google";
import { Hi_Melody } from "next/font/google";

const hiMelody = Hi_Melody({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
});

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun",
});

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "고이담아 | 소중한 추억을 봉인하세요",
  description: "시간과 장소가 맞아야 열리는 타임캡슐 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${gowunBatang.variable} ${notoSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="//dapi.kakao.com" />
        <link rel="dns-prefetch" href="//dapi.kakao.com" />
      </head>

      <body className="bg-[#E5E0DA] font-noto antialiased">
        <div className="max-w-[480px] mx-auto min-h-screen bg-[#FCFAF7] shadow-sm relative flex flex-col overflow-hidden">
          <Providers>{children}</Providers>
        </div>

        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}