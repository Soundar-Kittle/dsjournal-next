import { getMonthGroupsBySlug } from "@/utils/journals";
import { getArticlesBySlugVolumeIssue } from "@/utils/volumeAndIssue";
import Link from "next/link";
import { BsDiamondHalf } from "react-icons/bs";
import { FaFile } from "react-icons/fa";

const Page = async ({ params }) => {
  const { slug } = await params;
  const {
    currentIssue
  } = await getMonthGroupsBySlug(slug);

  if (!currentIssue?.volume || !currentIssue?.issue) {
    return <p>No cuurent issue found.</p>;
  }

  const articles = await getArticlesBySlugVolumeIssue(slug, currentIssue.volume, currentIssue.issue);

  if (!articles || articles.length === 0) {
    return <p>No cuurent issue articles found.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-center">
        Volume {currentIssue.volume} Issue {currentIssue.issue}
      </h2>

      <div className="space-y-4">
        {articles.map((a) => (
          <div
            key={a.articleId}
            className="rounded border-b p-4 shadow border-[#bbb]"
          >
            <p className="text-sm mb-3 flex items-center space-x-1">
              <FaFile /> <span>Research Article</span> <BsDiamondHalf />
              <span>{a.articleId}</span>
            </p>
            <Link
              href={`/${slug}/${a.articleId}`}
              className="text-blue font-medium hover:text-light-blue text-lg inline-block mb-1"
            >
              {a.title}
            </Link>
            {a.authors?.length > 0 && (
              <p className="text-sm text-black mb-2">{a.authors.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
