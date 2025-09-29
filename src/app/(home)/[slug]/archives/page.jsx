import { getMonthGroupsBySlug } from "@/utils/jounals";
import ContentAccordian from "@/components/ui/ContentAccordian";

const Page = async ({ params }) => {
  const { slug } = await params;
  const monthGroups = await getMonthGroupsBySlug(slug);

  console.log(monthGroups);

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Archives</h2>
      <ContentAccordian data={monthGroups} open />
    </div>
  );
};

export default Page;
