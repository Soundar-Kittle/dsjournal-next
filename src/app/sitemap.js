// import { getStaticRoutes } from "@/utils";

// export default async function sitemap() {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://demo.dsjournals.com";

//   const routes = getStaticRoutes();
//   const services = await getServices();

//   const staticEntries = routes.map(({ url }) => ({
//     url: `${baseUrl}${url}`,
//     lastModified: new Date().toISOString(),
//     changeFrequency: "weekly",
//     priority: url === "/" ? 1.0 : 0.7,
//   }));

//   const serviceEntries = services.map((s) => ({
//     url: `${baseUrl}/services/${s.slug}`,
//     lastModified: new Date().toISOString(),
//     changeFrequency: "weekly",
//     priority: 0.8,
//   }));

//   return [...staticEntries, ...serviceEntries];
// }
