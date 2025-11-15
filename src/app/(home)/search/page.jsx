import Search from "@/components/Home/Search";
import { Suspense } from "react";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";

export async function generateMetadata() {
  return await generateDynamicMeta("search");
}

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Search />
    </Suspense>
  );
};

export default page;
