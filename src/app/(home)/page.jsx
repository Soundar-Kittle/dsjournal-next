import HeroBanner from "@/components/Hero/HeroBanner";
import AboutUs from "@/components/Home/AboutUs";
import OurFeatures from "@/components/Home/OurFeatures";
import WeFocusOn from "@/components/Home/WeFocusOn";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";
import { getBanners } from "@/utils/banners";

export async function generateMetadata() {
  return await generateDynamicMeta("/");
}

export default async function Page() {
  const data = await getBanners();
  return (
    <div className="min-h-screen flex flex-col shadow-md bg-white">
      <HeroBanner data={data} />
      <AboutUs title="About Us" />
      <OurFeatures />
      <WeFocusOn />
    </div>
  );
}
