import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import { getSettings } from "@/utils/getSettings";
import CookieConsentWrapper from "@/components/Cookie/CookieConsentWrapper";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const gtm = settings?.google_tag_manager_id;
  const ga = settings?.google_analytics_id;

  const gtmId = gtm ? (String(gtm).startsWith("GTM-") ? gtm : `GTM-${gtm}`) : null;
  const gaId = ga ? (String(ga).startsWith("G-") ? ga : `G-${ga}`) : null;
  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <div className="bg-[#f8f9fa]">
        <div className="bg-white max-w-8xl mx-auto flex flex-col min-h-screen">
          <Header settings={settings} />
          <main className="flex-grow">{children}</main>
          <Footer settings={settings} />
        </div>
        <CookieConsentWrapper />
      </div>
    </>
  );
}
