import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import { getSettings } from "@/utils/getSettings";
import CookieConsentWrapper from "@/components/Cookie/CookieConsentWrapper";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <>
      {/* <GoogleTagManager gtmId="GTM-TC3323V4" /> */}
      <div className="bg-[#f8f9fa]">
        <div className="bg-white max-w-8xl mx-auto flex flex-col min-h-screen">
          <Header settings={settings} />
          <main className="flex-grow">{children}</main>
          <Footer settings={settings} />
        </div>
        {/* 👇 Banner appears on all website pages */}
        <CookieConsentWrapper />
      </div>
      {/* <GoogleAnalytics gaId="G-X1GJ4EE6YR" /> */}
    </>
  );
}
