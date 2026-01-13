import { createDbConnection } from "@/lib/db";
import { getArticleById } from "@/utils/article";
import moment from "moment";
import Link from "next/link";
import { BsDownload } from "react-icons/bs";
import { FileSearch } from "lucide-react";
import { generateArticleSchema } from "@/lib/seo/generateArticleSchema";

export async function generateMetadata({ params }) {
  const { article: articleId, slug } = await params;
  const article = await getArticleById(articleId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dsjournals.com";

  const DEFAULT_PUBLISHER =
    process.env.NEXT_PUBLIC_PUBLISHER_NAME || "Dream Science";

  const publisher = article?.publisher?.trim() || DEFAULT_PUBLISHER;

  if (!article) {
    return {
      title: "Article Not Found",
      robots: "noindex, nofollow",
    };
  }

  const cleanText = (html, len = 200) =>
    html
      ? html
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .slice(0, len)
      : "";

  const articleUrl = `${baseUrl}/${slug}/${article.article_id}`;
  const coverImage = article.cover_image
    ? `${baseUrl}/${article.cover_image.replace(/^\/+/, "")}`
    : `${baseUrl}/default-cover.webp`;

  const pdfUrl = article.pdf_path
    ? `${baseUrl}/${article.pdf_path.replace(/^\/+/, "")}`
    : "";

  const formatScholarDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(d.getDate()).padStart(2, "0")}`;
  };

  const parseList = (v) => {
    if (!v) return [];

    try {
      const arr = Array.isArray(v)
        ? v
        : Array.isArray(JSON.parse(v))
        ? JSON.parse(v)
        : String(v).split(/[,;]\s*/);

      return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
    } catch {
      return [
        ...new Set(
          String(v)
            .split(/[,;]\s*/)
            .map((s) => s.trim())
            .filter(Boolean)
        ),
      ];
    }
  };
  const authors = parseList(article.authors);

  return {
    title: article.article_title,
    description: cleanText(article.abstract),
    robots: "index, follow",

    alternates: {
      canonical: articleUrl,
    },

    openGraph: {
      title: article.article_title,
      description: cleanText(article.abstract),
      url: articleUrl,
      type: "article",
      images: [{ url: coverImage, width: 1200, height: 630 }],
    },

    twitter: {
      card: "summary_large_image",
      title: article.article_title,
      description: cleanText(article.abstract),
      images: [coverImage],
    },

    // ✅ Google Scholar
    other: {
      citation_title: article.article_title,
      citation_publisher: publisher, // ✅ DEFAULTED
      citation_journal_title: article.journal_name,
      citation_author: authors,
      citation_volume: article.volume_number,
      citation_issue: article.issue_number,
      citation_firstpage: article.page_from,
      citation_lastpage: article.page_to,
      citation_year: article.year,
      citation_online_date: formatScholarDate(article.published),
      citation_publication_date: formatScholarDate(article.published),
      citation_doi: article.doi,
      citation_issn: article.issn_online,
      citation_pdf_url: pdfUrl,
      citation_language: article.language || "en",
    },
  };
}

export async function generateStaticParams() {
  const conn = await createDbConnection();
  const [rows] = await conn.query(
    "SELECT article_id FROM articles WHERE article_status = 'published'"
  );
  return rows.map((row) => ({ article: row.article_id }));
}

export default async function Page({ params }) {
  const { article: articleId, slug } = await params;
  const article = await getArticleById(articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-gray-100 p-5 rounded-full mb-6">
          <FileSearch className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-primary mb-3">
          Article Not Found
        </h1>
        <p className="text-gray-500 max-w-md mb-8 text-sm"> 
          We couldn't find the article you're looking for. It may have been
          removed, or the link might be incorrect.
        </p>
      </div>
    );
  }

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
  const schema = generateArticleSchema({
    article,
    authors,
    articleUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}/${article.article_id}`,
    pdfUrl: article.pdf_path
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/${article.pdf_path}`
      : "",
    journal: {
      journal_name: article.journal_name,
      issn_online: article.issn_online,
      issn_print: article.issn_print,
      publisher: article.publisher,
    },
  });
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
      {/* ✅ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
    </div>
  );
}
