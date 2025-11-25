import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import { getSettings } from "@/utils/getSettings";

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <div className="bg-[#f8f9fa]">
      <div className="bg-white max-w-8xl mx-auto flex flex-col min-h-screen">
        <Header settings={settings} />
        <main className="flex-grow">{children}</main>
        <Footer settings={settings} />
      </div>
    </div>
  );
}
