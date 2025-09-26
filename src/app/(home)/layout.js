import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import ScrollToHash from "@/hooks/ScrollToHash";

export default function RootLayout({ children }) {
  return (
    <div className="bg-[#f8f9fa] max-w-[1400px] mx-auto flex flex-col min-h-screen">
      <ScrollToHash />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
