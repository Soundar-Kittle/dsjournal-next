import { getMonthGroupsBySlug } from "@/utils/jounals";

const Page = async ({ params }) => {
  const { slug } = await params;
  const monthGroups = await getMonthGroupsBySlug(slug);

  return (
    <div>
      <h2 className="text-xl font-medium text-center mb-3">
        {monthGroups?.currentIssue?.label || "No Current Issue"}
      </h2>
    </div>
  );
};

export default Page;
