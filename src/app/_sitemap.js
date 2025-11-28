import { getSitemapArticles } from "@/utils/getSitemapArticles";
import { getStaticRoutes } from "@/utils/getStaticRoutes";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://dreamscience.com";

  const routes = await getStaticRoutes();

  const staticEntries = routes.map(({ url }) => ({
    url: `${baseUrl}/${url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: url === "/" ? 1.0 : 0.7,
  }));

  const articles = await getSitemapArticles();
  const articleEntries = articles.map((a) => ({
    url: `${baseUrl}/${a.journal_slug}/${a.article_id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...articleEntries];
}
