export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/author/", "/_next/", "/search"],
    },
    // sitemap: `${
    //   process.env.NEXT_PUBLIC_BASE_URL || "https://dreamscience.com"
    // }/sitemap.xml`,
  };
}
