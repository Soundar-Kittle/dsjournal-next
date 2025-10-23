// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
// import ArticleForm from "@/components/Dashboard/Journals/Article/ArticleForm";

// export default function Page() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const isEdit = searchParams.get("edit") === "1";
//   const editId = searchParams.get("id");
//   const idParam = searchParams.get("id");
// const articleIdParam = searchParams.get("article_id");

//   // guard so month effect doesn't overwrite prefilled months in edit
//   const monthsWerePrefilledRef = useRef(false);

//   const [form, setForm] = useState({
//     id: "", // <-- set when editing
//     article_status: "unpublished",
//     journal_id: jid || "",
//     volume_id: "",
//     issue_id: "",
//     month_from: "",
//     month_to: "",
//     article_id: "",
//     doi: "",
//     article_title: "",
//     authors: "",   // UI takes comma-separated string
//     abstract: "",
//     keywords: "",  // UI takes comma-separated string
//     page_from: "",
//     page_to: "",
//     references: "",
//     received: "",
//     revised: "",
//     accepted: "",
//     published: "",
//     pdf_path: "", // show existing file in edit
//   });

//   // metadata
//   const [journals, setJournals] = useState([]);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);
//   const [months, setMonths] = useState([]);

//   // submit + file
//   const [submitting, setSubmitting] = useState(false);
//   const [pdfFile, setPdfFile] = useState(null);

//   const onFileSelect = (file) => {
//     if (!file) return setPdfFile(null);
//     if (file.type !== "application/pdf") {
//       alert("Only PDF files are allowed.");
//       return;
//     }
//     const MAX = 10 * 1024 * 1024;
//     if (file.size > MAX) {
//       alert("PDF size must be ≤ 10 MB.");
//       return;
//     }
//     setPdfFile(file);
//   };

//   /** Initial meta (journals + volumes) */
//   useEffect(() => {
//     if (!jid) return;
//     (async () => {
//       try {
//         const [journalRes, volumeRes] = await Promise.all([
//           fetch(`/api/journals?id=${jid}`),
//           fetch(`/api/volume?journal_id=${jid}`),
//         ]);
//         const [journalData, volumeData] = await Promise.all([
//           journalRes.json(),
//           volumeRes.json(),
//         ]);

//         if (journalData?.success) {
//           const arr = Array.isArray(journalData.journals)
//             ? journalData.journals
//             : [journalData.journals];
//           setJournals(arr);
//         }
//         if (volumeData?.success) setVolumesMeta(volumeData.volumes);
//       } catch (e) {
//         console.error("initial meta load error", e);
//       }
//     })();
//   }, [jid]);

//   /** Load issues when volume changes */

//   useEffect(() => {
//   if (!form.volume_id) {
//     setIssuesMeta([]);
//     setMonths([]);
//     setForm((prev) => ({ ...prev, issue_id: "", month_from: "", month_to: "" }));
//     return;
//   }
//   (async () => {
//     try {
//       const res = await fetch(`/api/issues?journal_id=${jid}&volume_id=${form.volume_id}`);
//       const data = await res.json();
//       if (data?.success) {
//         const issues = data.issues || [];
//         setIssuesMeta(issues);

//         if (issues.length > 0) {
//           // auto-pick first issue if none is selected already
//           setForm((prev) => ({
//             ...prev,
//             issue_id: prev.issue_id || String(issues[0].id),
//           }));
//         }
//       }
//     } catch (e) {
//       console.error("issue load error", e);
//     }
//   })();
// }, [form.volume_id, jid]);

//   /** Load months-group when issue changes. 
//    *  If editing and months already present, DO NOT overwrite.
//    */
//   useEffect(() => {
//     if (!form.issue_id) {
//       setMonths([]);
//       setForm((prev) => ({ ...prev, month_from: "", month_to: "" }));
//       return;
//     }
//     if (!jid) return;

//     let cancelled = false;

//     (async () => {
//       try {
//         const res = await fetch(
//           `/api/month-groups?journal_id=${encodeURIComponent(jid)}&issue_id=${encodeURIComponent(form.issue_id)}`
//         );
//         const data = await res.json();
//         if (cancelled) return;

//         const row = Array.isArray(data?.months) && data.months.length ? data.months[0] : null;

//         // build an options list (cosmetic; selects are disabled)
//         const list = row
//           ? [
//               ...(row.from_month ? [{ id: String(row.from_month), label: String(row.from_month) }] : []),
//               ...(row.to_month && row.to_month !== row.from_month
//                 ? [{ id: String(row.to_month), label: String(row.to_month) }]
//                 : []),
//             ]
//           : [];
//         setMonths(list);

//         // only auto-fill if NOT already prefilled (edit path)
//         if (!monthsWerePrefilledRef.current) {
//           if (row) {
//             setForm((prev) => ({
//               ...prev,
//               month_from: String(row.from_month ?? ""),
//               month_to: String(row.to_month ?? ""),
//             }));
//           } else {
//             setForm((prev) => ({ ...prev, month_from: "", month_to: "" }));
//           }
//         }
//       } catch (e) {
//         console.error("month load error", e);
//         setMonths([]);
//         if (!monthsWerePrefilledRef.current) {
//           setForm((prev) => ({ ...prev, month_from: "", month_to: "" }));
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [form.issue_id, jid]);

//   function toDateInput(val) {
//   if (!val) return "";
//   // If it's already a "YYYY-MM-DD..." string, trim to 10 chars
//   if (typeof val === "string") {
//     const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
//     if (m) return `${m[1]}-${m[2]}-${m[3]}`;
//   }
//   // Otherwise handle Date/ISO with timezone safely
//   const d = new Date(val);
//   if (isNaN(d)) return "";
//   // Shift by timezone so local->yyyy-mm-dd matches the stored date
//   const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
//   return local.toISOString().slice(0, 10); // YYYY-MM-DD
// }


//   /** If editing, fetch the record and prefill the form */
// useEffect(() => {
//   if (!isEdit) return;
//   const url = idParam
//     ? `/api/articles?id=${encodeURIComponent(idParam)}`
//     : articleIdParam
//       ? `/api/articles?article_id=${encodeURIComponent(articleIdParam)}`
//       : null;
//   if (!url) return;

//   (async () => {
//     const res = await fetch(url);
//     const data = await res.json();
//     if (!res.ok || !data?.success || !data.article) {
//       alert("Article not found.");
//       return;
//     }
//     const a = data.article;

//     // date-normalize helper
//     const toDate = (v) => (typeof v === "string" ? v.slice(0, 10) : "");

//     setForm((prev) => ({
//       ...prev,
//       id: a.id,
//       article_status: a.article_status || "unpublished",
//       journal_id: String(a.journal_id ?? ""),
//       volume_id: String(a.volume_id ?? ""),
//       issue_id: String(a.issue_id ?? ""),
//       month_from: a.month_from ? String(a.month_from) : "",
//       month_to: a.month_to ? String(a.month_to) : "",
//       article_id: a.article_id || "",
//       doi: a.doi || "",
//       article_title: a.article_title || "",
//       authors: (Array.isArray(a.authors) ? a.authors : JSON.parse(a.authors || "[]")).join(", "),
//       abstract: a.abstract || "",
//       keywords: (Array.isArray(a.keywords) ? a.keywords : JSON.parse(a.keywords || "[]")).join(", "),
//       page_from: a.page_from ? String(a.page_from) : "",
//       page_to: a.page_to ? String(a.page_to) : "",
//       references: a.references || "",
//       received: toDate(a.received),
//       revised: toDate(a.revised),
//       accepted: toDate(a.accepted),
//       published: toDate(a.published),
//       pdf_path: a.pdf_path || "",
//     }));
//   })();
// }, [isEdit, idParam, articleIdParam]);
//   /** Controlled update helper (resets children appropriately) */
//   const handleFormUpdate = (updated) => {
//     setForm((prev) => {
//       let next = { ...prev, ...updated };

//       // if journal changes -> clear all children
//       if (updated.journal_id && updated.journal_id !== prev.journal_id) {
//         next.volume_id = "";
//         next.issue_id = "";
//         next.month_from = "";
//         next.month_to = "";
//       }

//       // if volume changes -> clear issue + months
//       if (updated.volume_id && updated.volume_id !== prev.volume_id) {
//         next.issue_id = "";
//         next.month_from = "";
//         next.month_to = "";
//       }

//       // if issue changes -> clear months (effect will fill or keep edit values based on ref)
//       if (updated.issue_id && updated.issue_id !== prev.issue_id) {
//         // when user changes issue in edit mode, allow auto-fill again
//         monthsWerePrefilledRef.current = false;
//         next.month_from = "";
//         next.month_to = "";
//       }

//       return next;
//     });
//   };

//   /** Submit (create or update) */
// /** Submit (create or update) */
// const onSubmit = async () => {
//   try {
//     if (!form.journal_id || !form.volume_id || !form.issue_id) {
//       alert("Please select Journal, Volume and Issue.");
//       return;
//     }
//     if (!form.article_title) {
//       alert("Please enter the article title.");
//       return;
//     }

//     setSubmitting(true);

//     const fd = new FormData();
//     if (form.id) fd.append("id", String(form.id)); // <-- makes it an update

//     fd.append("journal_id", String(form.journal_id || ""));
//     fd.append("volume_id", String(form.volume_id || ""));
//     fd.append("issue_id", String(form.issue_id || ""));
//     fd.append("month_from", String(form.month_from || ""));
//     fd.append("month_to", String(form.month_to || ""));
//     fd.append("article_id", String(form.article_id || ""));
//     fd.append("doi", String(form.doi || ""));
//     fd.append("article_title", String(form.article_title || ""));
//     fd.append("authors", String(form.authors || "")); // comma-separated; server splits
//     fd.append("abstract", String(form.abstract || ""));
//     fd.append("keywords", String(form.keywords || "")); // comma-separated
//     fd.append("references", String(form.references || ""));
//     fd.append("received", String(form.received || ""));
//     fd.append("revised", String(form.revised || ""));
//     fd.append("accepted", String(form.accepted || ""));
//     fd.append("published", String(form.published || ""));
//     fd.append("page_from", String(form.page_from || ""));
//     fd.append("page_to", String(form.page_to || ""));
//     fd.append("article_status", String(form.article_status || "unpublished"));

//     if (pdfFile) fd.append("pdf", pdfFile);

//     const res = await fetch("/api/articles", { method: "POST", body: fd });

//     let data;
//     try {
//       data = await res.json();
//     } catch {
//       throw new Error("Server returned invalid JSON.");
//     }

//     if (!res.ok || !data?.success) {
//       // ✅ Show backend validation messages
//       throw new Error(data?.message || data?.error || "Failed to save article");
//     }

//     alert(isEdit ? "Article updated successfully." : "Article created successfully.");


// if (isEdit) {
//   window.location.href = `/admin/dashboard/journals/${jid}`; // back to listing
// } else {
//   setPdfFile(null);
//   setForm({...resetForm});
// }
//   } catch (err) {
//     console.error("Save article error:", err);
//     alert(err.message || "Something went wrong. Please try again.");
//   } finally {
//     setSubmitting(false);
//   }
// };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <ArticleForm
//         form={form}
//         setForm={handleFormUpdate}
//         onSubmit={onSubmit}
//         submitting={submitting}
//         onFileSelect={onFileSelect}
//         selectedFile={pdfFile}
//         journals={journals}
//         volumesMeta={volumesMeta}
//         issuesMeta={issuesMeta}
//         months={months}
//         disabledJournal={false}
//       />
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
// import ArticleForm from "@/components/Dashboard/Journals/Article/ArticleForm";

// const resetForm = {
//   id: "",
//   article_status: "unpublished",
//   journal_id: "",
//   volume_id: "",
//   issue_id: "",
//   month_from: "",
//   month_to: "",
//   article_id: "",
//   doi: "",
//   article_title: "",
//   authors: "",
//   abstract: "",
//   keywords: "",
//   page_from: "",
//   page_to: "",
//   references: "",
//   received: "",
//   revised: "",
//   accepted: "",
//   published: "",
//   pdf_path: "",
// };

// export default function Page() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const isEdit = searchParams.get("edit") === "1";
//   const idParam = searchParams.get("id");
//   const articleIdParam = searchParams.get("article_id");

//   const monthsWerePrefilledRef = useRef(false);

//   const [form, setForm] = useState({ ...resetForm, journal_id: jid || "" });
//   const [journals, setJournals] = useState([]);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);
//   const [months, setMonths] = useState([]);

//   const [submitting, setSubmitting] = useState(false);
//   const [pdfFile, setPdfFile] = useState(null);
// const [journalSlug, setJournalSlug] = useState("");

//   const safeParseArray = (val) => {
//   if (!val) return [];
//   if (Array.isArray(val)) return val;
//   if (typeof val === "string") {
//     try {
//       const parsed = JSON.parse(val);
//       return Array.isArray(parsed) ? parsed : [val];
//     } catch {
//       // not JSON, treat as plain string with commas
//       return val.split(",").map((s) => s.trim()).filter(Boolean);
//     }
//   }
//   return [];
// };

//   /** File select */
//   const onFileSelect = (file) => {
//     if (!file) return setPdfFile(null);
//     if (file.type !== "application/pdf") {
//       alert("Only PDF files are allowed.");
//       return;
//     }
//     const MAX = 10 * 1024 * 1024;
//     if (file.size > MAX) {
//       alert("PDF size must be ≤ 10 MB.");
//       return;
//     }
//     setPdfFile(file);
//   };

//   /** Initial meta load */
// useEffect(() => {
//   if (!jid) return;
//   (async () => {
//     try {
//       const [journalRes, volumeRes] = await Promise.all([
//         fetch(`/api/journals?id=${jid}`),
//         fetch(`/api/volume?journal_id=${jid}`),
//       ]);
//       const [journalData, volumeData] = await Promise.all([
//         journalRes.json(),
//         volumeRes.json(),
//       ]);
//       if (journalData?.success) {
//         const arr = Array.isArray(journalData.journals)
//           ? journalData.journals
//           : [journalData.journals];
//         setJournals(arr);
//         if (arr[0]?.short_name) {
//           setJournalSlug(arr[0].short_name);
//         }
//       }
//       if (volumeData?.success) setVolumesMeta(volumeData.volumes);
//     } catch (e) {
//       console.error("initial meta load error", e);
//     }
//   })();
// }, [jid]);
//   /** Issues on volume change */
//   useEffect(() => {
//     if (!form.volume_id) {
//       setIssuesMeta([]);
//       setMonths([]);
//       setForm((p) => ({ ...p, issue_id: "", month_from: "", month_to: "" }));
//       return;
//     }
//     (async () => {
//       try {
//         const res = await fetch(
//           `/api/issues?journal_id=${jid}&volume_id=${form.volume_id}`
//         );
//         const data = await res.json();
//         if (data?.success) {
//           setIssuesMeta(data.issues || []);
//           if (data.issues?.length && !form.issue_id) {
//             setForm((p) => ({ ...p, issue_id: String(data.issues[0].id) }));
//           }
//         }
//       } catch (e) {
//         console.error("issue load error", e);
//       }
//     })();
//   }, [form.volume_id, jid]);

//   /** Months on issue change */
//   useEffect(() => {
//     if (!form.issue_id || !jid) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await fetch(
//           `/api/month-groups?journal_id=${jid}&issue_id=${form.issue_id}`
//         );
//         const data = await res.json();
//         if (cancelled) return;

//         const row =
//           Array.isArray(data?.months) && data.months.length
//             ? data.months[0]
//             : null;
//         const list = row
//           ? [
//               ...(row.from_month
//                 ? [{ id: String(row.from_month), label: row.from_month }]
//                 : []),
//               ...(row.to_month && row.to_month !== row.from_month
//                 ? [{ id: String(row.to_month), label: row.to_month }]
//                 : []),
//             ]
//           : [];
//         setMonths(list);

//         if (!monthsWerePrefilledRef.current) {
//           setForm((p) => ({
//             ...p,
//             month_from: row?.from_month ? String(row.from_month) : "",
//             month_to: row?.to_month ? String(row.to_month) : "",
//           }));
//         }
//       } catch (e) {
//         console.error("month load error", e);
//         setMonths([]);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [form.issue_id, jid]);

//   /** Prefill on edit */
//   useEffect(() => {
//     if (!isEdit) return;
//     const url = idParam
//       ? `/api/articles?id=${idParam}`
//       : articleIdParam
//       ? `/api/articles?article_id=${articleIdParam}`
//       : null;
//     if (!url) return;
//     (async () => {
//       const res = await fetch(url);
//       const data = await res.json();
//       if (!res.ok || !data?.success || !data.article) {
//         alert("Article not found.");
//         return;
//       }
//       const a = data.article;
//       const toDate = (v) =>
//         typeof v === "string" ? v.slice(0, 10) : "";

// setForm((p) => ({
//   ...p,
//   id: a.id,
//   article_status: a.article_status || "unpublished",
//   journal_id: String(a.journal_id ?? ""),
//   volume_id: String(a.volume_id ?? ""),
//   issue_id: String(a.issue_id ?? ""),
//   month_from: a.month_from ? String(a.month_from) : "",
//   month_to: a.month_to ? String(a.month_to) : "",
//   article_id: a.article_id || "",
//   doi: a.doi || "",
//   article_title: a.article_title || "",
//   authors: safeParseArray(a.authors).join(", "),
//   abstract: a.abstract || "",
//   keywords: safeParseArray(a.keywords).join(", "),
//   page_from: a.page_from ? String(a.page_from) : "",
//   page_to: a.page_to ? String(a.page_to) : "",
//   references: a.references || "",
//   received: toDate(a.received),
//   revised: toDate(a.revised),
//   accepted: toDate(a.accepted),
//   published: toDate(a.published),
//   pdf_path: a.pdf_path || "",
// }));

//       monthsWerePrefilledRef.current = true;
//     })();
//   }, [isEdit, idParam, articleIdParam]);

//   /** Controlled updates */
//   const handleFormUpdate = (updated) => {
//     setForm((prev) => {
//       let next = { ...prev, ...updated };
//       if (updated.journal_id && updated.journal_id !== prev.journal_id) {
//         next.volume_id = next.issue_id = next.month_from = next.month_to = "";
//       }
//       if (updated.volume_id && updated.volume_id !== prev.volume_id) {
//         next.issue_id = next.month_from = next.month_to = "";
//       }
//       if (updated.issue_id && updated.issue_id !== prev.issue_id) {
//         monthsWerePrefilledRef.current = false;
//         next.month_from = next.month_to = "";
//       }
//       return next;
//     });
//   };

//   /** Submit handler */
// /** Submit handler */
// const onSubmit = async () => {
//   try {
//     if (!form.journal_id || !form.volume_id || !form.issue_id) {
//       alert("Please select Journal, Volume and Issue.");
//       return;
//     }
//     if (!form.article_title) {
//       alert("Please enter the article title.");
//       return;
//     }

//     setSubmitting(true);

//     const fd = new FormData();

//     // Always include required fields
//     Object.entries(form).forEach(([k, v]) => {
//       // 👇 only append id if it's an update
//       if (k === "id" && !form.id) return;
//       fd.append(k, v ?? "");
//     });

//     if (pdfFile) fd.append("pdf", pdfFile);

//     const method = form.id ? "PUT" : "POST";
//     const res = await fetch("/api/articles", { method, body: fd });
//     const data = await res.json();

//     if (!res.ok || !data?.success) throw new Error(data.message);

//     alert(form.id ? "Article updated successfully." : "Article created successfully.");

// if (form.id) {
//   // after update → go back to archives
//   window.location.href = `/admin/dashboard/journals/${journalSlug}/archives?jid=${jid}`;
// } else {
//   // after create → reset form
//   setPdfFile(null);
//   setForm({ ...resetForm, journal_id: jid || "" });
// }
//   } catch (err) {
//     console.error("Save error:", err);
//     alert(err.message || "Something went wrong.");
//   } finally {
//     setSubmitting(false);
//   }
// };



//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <ArticleForm
//         form={form}
//         setForm={handleFormUpdate}
//         onSubmit={onSubmit}
//         submitting={submitting}
//         onFileSelect={onFileSelect}
//         selectedFile={pdfFile}
//         journals={journals}
//         volumesMeta={volumesMeta}
//         issuesMeta={issuesMeta}
//         months={months}
//         disabledJournal={false}
//       />
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ArticleForm from "@/components/Dashboard/Journals/Article/ArticleForm";

const resetForm = {
  id: "",
  article_status: "unpublished",
  journal_id: "",
  volume_id: "",
  issue_id: "",
  month_from: "",
  month_to: "",
  article_id: "",
  doi: "",
  article_title: "",
  authors: "",
  abstract: "",
  keywords: "",
  page_from: "",
  page_to: "",
  references: "",
  received: "",
  revised: "",
  accepted: "",
  published: "",
  pdf_path: "",
};

export default function Page() {
  const searchParams = useSearchParams();
  const jid = searchParams.get("jid"); // 👈 Journal ID from URL
  const isEdit = searchParams.get("edit") === "1";
  const idParam = searchParams.get("id");
  const articleIdParam = searchParams.get("article_id");

  const monthsWerePrefilledRef = useRef(false);

  const [form, setForm] = useState({ ...resetForm, journal_id: jid || "" });
  const [journals, setJournals] = useState([]);
  const [volumesMeta, setVolumesMeta] = useState([]);
  const [issuesMeta, setIssuesMeta] = useState([]);
  const [months, setMonths] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [journalSlug, setJournalSlug] = useState("");

  /** File select */
  const onFileSelect = (file) => {
    if (!file) return setPdfFile(null);
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      alert("PDF size must be ≤ 10 MB.");
      return;
    }
    setPdfFile(file);
  };

  /** Initial meta load */
  useEffect(() => {
    if (!jid) return;
    (async () => {
      try {
        const [journalRes, volumeRes] = await Promise.all([
          fetch(`/api/journals?id=${jid}`),
          fetch(`/api/volume?journal_id=${jid}`),
        ]);

        const [journalData, volumeData] = await Promise.all([
          journalRes.json(),
          volumeRes.json(),
        ]);

        if (journalData?.success) {
          const arr = Array.isArray(journalData.journals)
            ? journalData.journals
            : [journalData.journals];

          setJournals(arr);

          // ✅ Automatically assign name to select (if not already set)
          if (arr.length && !form.journal_id) {
            setForm((prev) => ({
              ...prev,
              journal_id: String(arr[0].id),
            }));
          }

          if (arr[0]?.short_name) {
            setJournalSlug(arr[0].short_name);
          }
        }

        if (volumeData?.success) {
          setVolumesMeta(volumeData.volumes);
        }
      } catch (e) {
        console.error("initial meta load error", e);
      }
    })();
  }, [jid]);

  /** Issues on volume change */
  useEffect(() => {
    if (!form.volume_id) {
      setIssuesMeta([]);
      setMonths([]);
      setForm((p) => ({
        ...p,
        issue_id: "",
        month_from: "",
        month_to: "",
      }));
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/issues?journal_id=${jid}&volume_id=${form.volume_id}`
        );
        const data = await res.json();
        if (data?.success) {
          setIssuesMeta(data.issues || []);
          if (data.issues?.length && !form.issue_id) {
            setForm((p) => ({ ...p, issue_id: String(data.issues[0].id) }));
          }
        }
      } catch (e) {
        console.error("issue load error", e);
      }
    })();
  }, [form.volume_id, jid]);

  /** Months on issue change */
  useEffect(() => {
    if (!form.issue_id || !jid) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/month-groups?journal_id=${jid}&issue_id=${form.issue_id}`
        );
        const data = await res.json();
        if (cancelled) return;

        const row =
          Array.isArray(data?.months) && data.months.length
            ? data.months[0]
            : null;

        const list = row
          ? [
              ...(row.from_month
                ? [{ id: String(row.from_month), label: row.from_month }]
                : []),
              ...(row.to_month && row.to_month !== row.from_month
                ? [{ id: String(row.to_month), label: row.to_month }]
                : []),
            ]
          : [];

        setMonths(list);

        if (!monthsWerePrefilledRef.current) {
          setForm((p) => ({
            ...p,
            month_from: row?.from_month ? String(row.from_month) : "",
            month_to: row?.to_month ? String(row.to_month) : "",
          }));
        }
      } catch (e) {
        console.error("month load error", e);
        setMonths([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.issue_id, jid]);

  /** Controlled updates */
  const handleFormUpdate = (updated) => {
    setForm((prev) => {
      let next = { ...prev, ...updated };
      if (updated.journal_id && updated.journal_id !== prev.journal_id) {
        next.volume_id = next.issue_id = next.month_from = next.month_to = "";
      }
      if (updated.volume_id && updated.volume_id !== prev.volume_id) {
        next.issue_id = next.month_from = next.month_to = "";
      }
      if (updated.issue_id && updated.issue_id !== prev.issue_id) {
        monthsWerePrefilledRef.current = false;
        next.month_from = next.month_to = "";
      }
      return next;
    });
  };

  /** Submit handler */
  const onSubmit = async () => {
    try {
      if (!form.journal_id || !form.volume_id || !form.issue_id) {
        alert("Please select Journal, Volume and Issue.");
        return;
      }
      if (!form.article_title) {
        alert("Please enter the article title.");
        return;
      }

      setSubmitting(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "id" && !form.id) return;
        fd.append(k, v ?? "");
      });

      if (pdfFile) fd.append("pdf", pdfFile);

      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/articles", { method, body: fd });
      const data = await res.json();

      if (!res.ok || !data?.success) throw new Error(data.message);

      alert(
        form.id
          ? "Article updated successfully."
          : "Article created successfully."
      );

      if (form.id) {
        window.location.href = `/admin/dashboard/journals/${journalSlug}/archives?jid=${jid}`;
      } else {
        setPdfFile(null);
        setForm({ ...resetForm, journal_id: jid || "" });
      }
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1>Add form</h1>
<ArticleForm
  journals={journals}
  volumesMeta={volumesMeta}
  fetchIssuesByVolume={async (volumeId) => {
    const res = await fetch(`/api/issues?journal_id=${jid}&volume_id=${volumeId}`);
    const data = await res.json();
    return data?.issues || [];
  }}
  defaultJournalId={jid}
  disabledJournal={true}
  onSubmit={onSubmit}
  submitting={submitting}
  onFileSelect={onFileSelect}
  selectedFile={pdfFile}
/>
    </div>
  );
}
