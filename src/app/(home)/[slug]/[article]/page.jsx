import { getArticleById } from "@/utils/article";
import moment from "moment";
import Link from "next/link";
import { BsDownload } from "react-icons/bs";

const cleanAbstract = (html, maxLength = 150) => {
  if (!html) return "";

  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..."
    : text;
};

export async function generateMetadata({ params }) {
  const { article: articleId, slug } = await params;
  const article = await getArticleById(articleId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const formatScholarDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // 👤 Normalize authors/keywords (LONGTEXT, JSON, or CSV)
  const parseList = (v) => {
    if (!v) return [];
    try {
      if (Array.isArray(v)) return v;
      const parsed = JSON.parse(v);
      return Array.isArray(parsed)
        ? parsed
        : String(v)
            .split(/[,;]\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
    } catch {
      return String(v)
        .split(/[,;]\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const authors = parseList(article.authors);
  const keywords = parseList(article.keywords);

  const pdfUrl = article.pdf_path
    ? `${baseUrl.replace(/\/$/, "")}/${article.pdf_path.replace(
        /^(\.\.\/)+/,
        ""
      )}`
    : "";

  const articleUrl = `${baseUrl}/${slug}/${article.article_id}`;
  const coverImage = article.cover_image?.startsWith("http")
    ? article.cover_image
    : `${baseUrl}/${article.cover_image || "default-cover.webp"}`;

  const shortAbstract = cleanAbstract(article.abstract, 200);

  return {
    title: article.article_title,
    description: shortAbstract,
    keywords,
    openGraph: {
      url: articleUrl,
      siteName: "dsjournals",
      title: article.article_title,
      description: shortAbstract,
      type: "website",
      images: [{ url: coverImage, type: "image/webp" }],
    },

    twitter: {
      card: "summary_large_image",
      site: "website",
      title: article.article_title,
      description: shortAbstract,
      images: [coverImage],
      url: "https://twitter.com/DreamScience4",
    },

    alternates: {
      canonical: articleUrl,
    },

    other: {
      Author: authors.join(", "),
      rights: `Copyright ${article.publisher}`,
      citation_title: article.article_title,
      citation_journal_title: article.journal_name,
      citation_publisher: article.publisher,
      citation_author: authors.join(", "),
      citation_volume: article.volume_number,
      citation_year: article.year,
      citation_publication_date: formatScholarDate(article.published),
      citation_online_date: formatScholarDate(article.published),
      citation_doi: article.doi,
      citation_issn: article.issn_online,
      citation_abstract: article.abstract,
      citation_pdf_url: pdfUrl,
      citation_language: article.language,
      "og:image:type": "image/webp",
      robots: "index, follow",
    },
  };
}




export default async function Page({ params }) {
  const { article: articleId } = await params;
  const article = await getArticleById(articleId);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">Article not found.</p>
      </div>
    );
  }

  // 👤 Normalize authors, keywords, references
  const parseList = (v) => {
    if (!v) return [];
    try {
      if (Array.isArray(v)) return v;
      const parsed = JSON.parse(v);
      return Array.isArray(parsed)
        ? parsed
        : String(v)
            .split(/[,;]\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
    } catch {
      return String(v)
        .split(/[,;]\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const authors = parseList(article.authors);
  const keywords = parseList(article.keywords);
  const references = article.references || "";

  // 🔗 Clean DOI (can be bare "10.xxxx/…" or full URL)
  const doi = article.doi?.trim() || "";
  const doiHref = doi
    ? doi.startsWith("http")
      ? doi
      : `https://doi.org/${doi}${
          article.article_id ? `/${article.article_id}` : ""
        }`
    : "";
  return (
    <div className="space-y-6 pt-4">
      {/* Header Section */}
      <div className="mb-2">
        <p className="text-md font-medium mb-2">
          Research Article | Open Access |{" "}
          {article.pdf_path && (
            <Link
              href={`/${article.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue font-bold hover:text-light-blue inline-flex items-center gap-1"
            >
              <BsDownload className="h-4 w-4" />
              <span>Download Full Text</span>
            </Link>
          )}
        </p>

        <p className="text-xs">
          Volume {article.volume_number} | Issue {article.issue_number} | Year{" "}
          {article.year} | Article Id: {articleId}{" "}
          {doiHref && (
            <>
              {" "}
              DOI:{" "}
              <a
                href={doiHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue hover:text-light-blue"
              >
                {doiHref}
              </a>
            </>
          )}
        </p>

        <h1 className="text-[24px] font-medium mt-4 pb-3 border-b leading-snug">
          {article.article_title}
        </h1>

        {authors.length > 0 && (
          <p className="text-xs my-4 font-semibold">{authors.join(", ")}</p>
        )}
      </div>

      {/* Dates */}
      <div className="overflow-x-auto border-y">
        <table className="min-w-full text-center max-sm:text-sm">
          <thead>
            <tr>
              <th className=" font-normal">Received</th>
              <th className=" font-normal border-x">Revised</th>
              <th className=" font-normal border-x">Accepted</th>
              <th className=" font-normal">Published</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="">
                {(article.received &&
                  moment(article.received).format("DD MMM YYYY")) ||
                  "-"}
              </td>
              <td className=" border-x">
                {(article.revised &&
                  moment(article.revised).format("DD MMM YYYY")) ||
                  "-"}
              </td>
              <td className=" border-x">
                {(article.accepted &&
                  moment(article.accepted).format("DD MMM YYYY")) ||
                  "-"}
              </td>
              <td className="">
                {(article.published &&
                  moment(article.published).format("DD MMM YYYY")) ||
                  "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Citation */}
      <div>
        <h2 className="text-lg font-semibold">Citation</h2>
        <p className="mt-1">
          {authors.join(", ")}. “{article.article_title}.”{" "}
          <em>{article.journal_name || "Journal Name"}</em>, vol.{" "}
          {article.volume_number}, no. {article.issue_number}, pp.{" "}
          {article.page_from}-{article.page_to}, {article.year}.{" "}
        </p>
      </div>

      {/* Abstract */}
      {article.abstract && (
        <div>
          <h2 className="text-lg font-semibold">Abstract</h2>
          {/* <div
            className="mt-2 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.abstract }}
          /> */}
          <div
  className="article-content"
  dangerouslySetInnerHTML={{ __html: article.abstract }}
/>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Keywords</h2>
          <p className="mt-1">{keywords.join(", ")}</p>
        </div>
      )}

      {/* References */}
{references && (
  <div>
    <h2 className="text-lg font-semibold">References</h2>

   <div
  className="references-content whitespace-normal break-words space-y-1 leading-relaxed"
  dangerouslySetInnerHTML={{ __html: references }}
/>

  </div>
)}
    </div>
  );
}
