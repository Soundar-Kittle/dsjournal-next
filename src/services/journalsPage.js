import { useApiQuery } from "@/hooks";

export const journalsPage = {
  add: {
    url: "/journal-pages",
    method: "POST",
    key: ["journal-page", "add"],
  },
  get: {
    url: "/journal-pages?all=true",
    method: "GET",
    key: ["journal-page", "all"],
  },
  update: {
    url: "/journal-pages",
    method: "PATCH",
    key: ["journal-page", "update"],
  },
  delete: {
    url: "/journal-pages",
    method: "DELETE",
    key: ["journal-page", "delete"],
  },
};

export const useJournalsPages = () =>
  useApiQuery({
    key: journalsPage.get.key,
    endpoint: journalsPage.get.url,
    method: journalsPage.get.method,
  });
