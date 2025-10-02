import { getArticleById } from "@/utils/article";
import { BsDownload } from "react-icons/bs";

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

  return (
    <div className="space-y-6 pt-4">
      <div className="mb-2">
        <p className="text-md font-medium mb-2">
          Research Article | Open Access |{" "}
          {article.pdf_path && (
            <a
              href={article.pdf_path}
              download={`${article.article_title}-${articleId}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue font-bold hover:text-light-blue inline-flex items-center gap-1"
            >
              <BsDownload className="h-4 w-4" />
             <span>
               Download Full Text
             </span>
            </a>
          )}
        </p>
        <p className="text-xs">
          Volume {article.volume_number} | Issue {article.issue_number} | Year{" "}
          {article.year} | Article Id: {articleId} |{" "}
          {article.doi && (
            <a href={article.doi} target="_blank">
              DOI :{" "}
              <span className="text-blue hover:text-light-blue">
                {article.doi}
              </span>
            </a>
          )}
        </p>

        <h1 className="text-[24px] font-medium mt-4 pb-3 border-b-2 leading-snug">
          {article.article_title}
        </h1>

        {article.authors?.length > 0 && (
          <p className="text-xs mt-2 font-semibold">
            {article.authors.join(", ")}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="overflow-x-auto border-y">
        <table className="min-w-full text-center">
          <thead>
            <tr>
              <th className="px-3 font-normal">Received</th>
              <th className="px-3 font-normal border-x">Revised</th>
              <th className="px-3 font-normal border-x">Accepted</th>
              <th className="px-3 font-normal">Published</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3">
                {new Date(article.received).toLocaleDateString()}
              </td>
              <td className="px-3 border-x">
                {new Date(article.revised).toLocaleDateString()}
              </td>
              <td className="px-3 border-x">
                {new Date(article.accepted).toLocaleDateString()}
              </td>
              <td className="px-3">
                {new Date(article.published).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Citation */}
      <div>
        <h2 className="text-lg font-semibold ">Citations</h2>
        <p className="mt-1">
          {article.authors.join(", ")}. “{article.article_title}.”{" "}
          <em>{article.journal_name || "Journal Name"}</em>, vol.{" "}
          {article.volume_number}, no. {article.issue_number}, pp.{" "}
          {article.page_from}-{article.page_to}, {article.year}.
        </p>
      </div>

      {/* Abstract */}
      {article.abstract && (
        <div>
          <h2 className="text-lg font-semibold ">Abstract</h2>
          <p className="mt-2 whitespace-pre-line">{article.abstract}</p>
        </div>
      )}

      {/* Keywords */}
      {article.keywords?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Keywords</h2>
          <p className="mt-1">{article.keywords.join(", ")}</p>
        </div>
      )}

      {/* References */}
      {article.references && (
        <div>
          <h2 className="text-lg font-semibold">References</h2>
          <div
            className="prose prose-sm max-w-none whitespace-normal break-words"
            dangerouslySetInnerHTML={{ __html: article.references }}
          />
        </div>
      )}
    </div>
  );
}
