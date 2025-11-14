import Link from "next/link";
import { getMonthGroupsBySlug } from "@/utils/journals";
import ContentAccordian from "@/components/ui/ContentAccordian";

const Page = async ({ params }) => {
  const { slug } = await params;
  const monthGroups = await getMonthGroupsBySlug(slug);

  const formattedData = monthGroups.grouped.map((group) => ({
    t: group.year,
    c: [
      <div className="space-y-3" key={group.year}>
        <ul>
          {group.items.map((item) => (
            <li key={item.href}>
              <Link
                href={`archives${item.href}`}
                className="text-blue hover:text-light-blue"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>,
    ],
  }));

  return (
    <div>
      <h2 className="text-xl font-medium text-center mb-3">Archives</h2>
      <ContentAccordian data={formattedData} open />
    </div>
  );
};

export default Page;
