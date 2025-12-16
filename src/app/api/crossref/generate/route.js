import { NextResponse } from "next/server";
import { getArticleById } from "@/utils/article";
import { generateCrossrefArticleXML } from "@/lib/crossref/generateArticleXML";
import { saveCrossrefXML } from "@/lib/crossref/saveCrossrefXML";

const parseList = (v) =>
  v
    ? String(v)
        .split(/[,;]\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export async function POST(req) {
  try {
    const { articleId, slug } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { ok: false, message: "Article ID required" },
        { status: 400 }
      );
    }

    const article = await getArticleById(articleId);
    if (!article) {
      return NextResponse.json(
        { ok: false, message: "Article not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const authors = parseList(article.authors);

    const xml = generateCrossrefArticleXML({
      article,
      authors,
      articleUrl: `${baseUrl}/${slug}/${article.article_id}`,
      pdfUrl: article.pdf_path
        ? `${baseUrl}/${article.pdf_path}`
        : "",
      journal: {
        journal_name: article.journal_name,
        issn_online: article.issn_online,
        issn_print: article.issn_print,
        publisher:
          article.publisher ||
          process.env.NEXT_PUBLIC_PUBLISHER ||
          "Dream Science",
      },
    });

const fileUrl = await saveCrossrefXML({
  articleId: article.article_id,
  xml,
});

    return NextResponse.json({
      ok: true,
      message: "Crossref XML generated",
      file: fileUrl,
    });
  } catch (error) {
    console.error("Crossref XML error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to generate XML" },
      { status: 500 }
    );
  }
}
