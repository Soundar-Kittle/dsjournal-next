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
