export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/author/",
        "/_next/",
        "/search",
        "/cookies-privacy-policy",
      ],
    },
    sitemap: "https://dsjournals.com/sitemap.xml",
  };
}
