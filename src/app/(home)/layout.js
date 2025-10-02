import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";

export default function RootLayout({ children }) {
  return (
    <div className="bg-[#f8f9fa]">
      <div className="bg-white max-w-8xl mx-auto flex flex-col min-h-screen shadow-sm">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
