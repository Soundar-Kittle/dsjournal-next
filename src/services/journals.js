import { useApiQuery } from "@/hooks";

export const journals = {
  add: {
    url: "/journals",
    method: "POST",
    key: ["journal", "add"],
  },
  getPaginated: {
    url: "/journals",
    method: "GET",
    key: ["journal", "paginated"],
  },
  getAll: {
    url: "/journals?all=true",
    method: "GET",
    key: ["journal", "all"],
  },
  update: {
    url: "/journals",
    method: "PATCH",
    key: ["journal", "update"],
  },
  delete: {
    url: "/journals",
    method: "DELETE",
    key: ["journal", "delete"],
  },
};

export const useJournals = () =>
  useApiQuery({
    key: journals.getAll.key,
    endpoint: journals.getAll.url,
    method: journals.getAll.method,
  });
