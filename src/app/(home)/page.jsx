import HeroBanner from "@/components/Hero/HeroBanner";
import AboutUs from "@/components/Home/AboutUs";
import OurFeatures from "@/components/Home/OurFeatures";
import WeFocusOn from "@/components/Home/WeFocusOn";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col shadow-md bg-white">
      <HeroBanner />
      <AboutUs title="About Us" />
      <OurFeatures />
      <WeFocusOn />
    </div>
  );
}
