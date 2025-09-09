import "./globals.css";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";

export const metadata = {
  title: "Dream Science | Engineering and Technology Journals",
  description: "Decentralized Journal Publishing Platform",
};

export default function RootLayout({ children }) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
