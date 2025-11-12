import { getStaticRoutes } from "@/utils/getStaticRoutes";
import { getJournals } from "@/utils/journals";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://demo.dreamscience.com";

  const routes = await getStaticRoutes();

  const staticEntries = routes.map(({ url }) => ({
    url: `${baseUrl}/${url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: url === "/" ? 1.0 : 0.7,
  }));

  // const journals = await getJournals();

  // const journalsEntries = journals.map((s) => ({
  //   url: `${baseUrl}/${s.slug}`,
  //   lastModified: new Date().toISOString(),
  //   changeFrequency: "weekly",
  //   priority: 0.8,
  // }));

  return [
    ...staticEntries,
    {
      url: `${baseUrl}/journals/sitemap.xml`,
      lastModified: new Date().toISOString(),
    },
  ];
}
