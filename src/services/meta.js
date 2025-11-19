import { useApiQuery } from "@/hooks";

export const metas = {
  add: {
    url: "/metas",
    method: "POST",
    key: ["meta", "add"],
  },
  getPaginated: {
    url: "/metas",
    method: "GET",
    key: ["meta", "paginated"],
  },
  getMeta: {
    url: "/seo",
    method: "GET",
    key: ["seo"],
    queryParams: { slug: "" },
  },
  getAll: {
    url: "/metas?all=true",
    method: "GET",
    key: ["meta", "all"],
  },
  update: {
    url: "/metas",
    method: "PATCH",
    key: ["meta", "update"],
  },
  delete: {
    url: "/metas",
    method: "DELETE",
    key: ["meta", "delete"],
  },
};

export const useMetas = () =>
  useApiQuery({
    key: metas.getPaginated.key,
    endpoint: metas.getPaginated.url,
    method: metas.getPaginated.method,
  });
  
export const useMetaSlugs = (slug) =>
  useApiQuery({
    key: metas.getMeta.key,
    endpoint: metas.getMeta.url,
    method: metas.getMeta.method,
    queryParams: { slug },
  });
