import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";

export const metadata = {
  title: "Dream Science | Engineering and Technology Journals",
  description: "Decentralized Journal Publishing Platform",
};

export default function RootLayout({ children }) {
  return (
    <div className="bg-[#f8f9fa] max-w-[1400px] mx-auto">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
