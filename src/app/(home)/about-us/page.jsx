import AboutUsPage from "@/components/Home/AboutUsPage";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";
export async function generateMetadata() {
  return await generateDynamicMeta("about-us");
}

const page = () => {
  return <AboutUsPage />;
};

export default page;
