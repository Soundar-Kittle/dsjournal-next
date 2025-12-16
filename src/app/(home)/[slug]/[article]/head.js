import { getArticleById } from "@/utils/article";

export default async function Head({ params }) {
  const articleId = params.article; // ❗ DO NOT await params
  if (!articleId) return null;

  const article = await getArticleById(articleId);
  if (!article?.authors) return null;

  const authors = String(article.authors)
    .split(/[,;]\s*/)
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <>
      {authors.map((author, index) => (
        <meta
          key={`citation-author-${index}`}
          name="citation_author"
          content={author}
        />
      ))}
    </>
  );
}
