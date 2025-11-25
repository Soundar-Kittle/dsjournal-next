import { useApiQuery } from "@/hooks";

export const sitemap = {
  get: {
    url: "/sitemap",
    method: "GET",
    key: ["sitemap", "all"],
  },
};

export const useSitemaps = () =>
  useApiQuery({
    key: sitemap.get.key,
    endpoint: sitemap.get.url,
    method: sitemap.get.method,
  });
