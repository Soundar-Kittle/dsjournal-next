import { useApiQuery } from "@/hooks";

export const banners = {
  add: {
    url: "/banners",
    method: "POST",
    key: ["banner", "add"],
  },
  getPaginated: {
    url: "/banners",
    method: "GET",
    key: ["banner", "paginated"],
  },
  getAll: {
    url: "/banners?all=true",
    method: "GET",
    key: ["banner", "all"],
  },
  update: {
    url: "/banners",
    method: "PATCH",
    key: ["banner", "update"],
  },
  delete: {
    url: "/banners",
    method: "DELETE",
    key: ["banner", "delete"],
  },
};

export const useBanners = () =>
  useApiQuery({
    key: banners.getPaginated.key,
    endpoint: banners.getPaginated.url,
    method: banners.getPaginated.method,
  });
