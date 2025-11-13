import { getArticlesBySlugVolumeIssue } from "@/utils/volumeAndIssue";
import Link from "next/link";
import { FaFile } from "react-icons/fa";
import { BsDiamondHalf } from "react-icons/bs";

export default async function Page({ params }) {
  const { slug, volume_issue } = await params;
  const [volumeStr, issueStr] = volume_issue;

  const volumeNum = volumeStr.match(/\d+/)?.[0];
  const issueNum = issueStr.match(/\d+/)?.[0];

  const articles = await getArticlesBySlugVolumeIssue(
    slug,
    volumeNum,
    issueNum
  );

  if (!articles || articles.length === 0) {
    return <p>No articles found.</p>;
  }

    // 👤 Normalize authors, keywords, references
const parseList = (v) => {
  if (!v) return [];

  try {
    if (Array.isArray(v)) return v;
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") v = parsed;
  } catch {
    // ignore JSON errors
  }

  return String(v)
    .trim()
    .replace(/^"+|"+$/g, "")    // remove leading/trailing double quotes
    .replace(/^'+|'+$/g, "")    // remove leading/trailing single quotes
    .replace(/^\[|\]$/g, "")    // remove [ ]
    .replace(/['"]+/g, "")      // remove any remaining quotes inside
    .split(/[,;]\s*/)           // split by comma or semicolon
    .map((s) => s.trim())
    .filter(Boolean);
};


  const { volume, issue, months, year } = articles[0];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">List of Articles</h2>
      <h3 className="text-lg font-medium text-center">
        Volume {volume} Issue {issue} , {months || ""} {year}
      </h3>

      <div className="space-y-4">
        {articles.map((a) => {
 const authors = parseList(a.authors); // ✅ parse once
            return (
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
         {parseList(a.authors)?.length > 0 && (
  <p className="text-sm text-black mb-2">
    {parseList(a.authors).join(", ")}
  </p>
)}
          </div>
        )
        })}
      </div>
    </div>
  );
}
