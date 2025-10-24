import { useApiQuery } from "@/hooks";

export const callForPaper = {
  add: {
    url: "/call-for-paper",
    method: "POST",
    key: ["call-for-paper", "add"],
  },
  getPaginated: {
    url: "/call-for-paper",
    method: "GET",
    key: ["call-for-paper", "paginated"],
  },
  getAll: {
    url: "/call-for-paper?all=true",
    method: "GET",
    key: ["call-for-paper", "all"],
  },
  update: {
    url: "/call-for-paper",
    method: "PATCH",
    key: ["call-for-paper", "update"],
  },
  delete: {
    url: "/call-for-paper",
    method: "DELETE",
    key: ["call-for-paper", "delete"],
  },
};

export const useCallForPaper = () =>
  useApiQuery({
    key: callForPaper.getAll.key,
    endpoint: callForPaper.getAll.url,
    method: callForPaper.getAll.method,
  });
