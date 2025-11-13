import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import PageTransition from "@/components/ui/PageTransition";
import RouteProgress from "@/components/ui/RouteProgress";

export default function RootLayout({ children }) {
  return (
    <div className="bg-[#f8f9fa]">
      <div className="bg-white max-w-8xl mx-auto flex flex-col min-h-screen">
        {/* <RouteProgress /> */}
        <Header />
        {/* <PageTransition> */}
        <main className="flex-grow">{children}</main>
        {/* </PageTransition> */}
        <Footer />
      </div>
    </div>
  );
}
