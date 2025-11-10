// import { useApiQuery } from "@/hooks";

// export const monthGroups = {
//   getByJournal: {
//     url: (journalId) => `/month-groups?journal_id=${journalId}`,
//     method: "GET",
//     key: (journalId) => ["monthGroups", "byJournal", journalId],
//   },
// };

// export const useMonthGroups = ({ journalId, enabled = false }) => {
//   return useApiQuery({
//     key: monthGroups.getByJournal.key(journalId),
//     endpoint: monthGroups.getByJournal.url(journalId),
//     method: monthGroups.getByJournal.method,
//     enabled,
//   });
// };

import { useApiQuery } from "@/hooks";

export const monthGroups = {
  getByJournal: {
    url: (journalId) => `/month-groups?journal_id=${journalId}`,
    method: "GET",
    key: (journalId) => ["monthGroups", "byJournal", journalId],
  },
};

export const useMonthGroups = ({ journalId, enabled = false }) => {
  return useApiQuery({
    key: monthGroups.getByJournal.key(journalId),
    endpoint: monthGroups.getByJournal.url(journalId),
    method: monthGroups.getByJournal.method,
    enabled,
    select: (data) => {
      // ✅ handle both key types safely
      const months = data?.months || data?.groups || [];
      console.log("✅ useMonthGroups -> months:", months);
      return { months };
    },
  });
};
