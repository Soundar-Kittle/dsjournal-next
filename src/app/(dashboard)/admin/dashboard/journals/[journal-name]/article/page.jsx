"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ArticleForm from "@/components/Dashboard/Journals/Article/ArticleForm";
import { ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";

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
  const router = useRouter();
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
  const [resetSignal, setResetSignal] = useState(0);

  const normalizeArrayField = (value) => {
    try {
      if (!value) return "";
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) {
        return arr.join(", ");
      }
      return value;
    } catch {
      return value; // if not JSON, return original
    }
  };

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

  const fetchIssuesByVolume = useCallback(
    async (volumeId, includeId = null) => {
      let url = `/api/issues?journal_id=${jid}&volume_id=${volumeId}`;
      if (includeId) url += `&include_id=${includeId}`; // ✅ only for edit mode
      const res = await fetch(url);
      const data = await res.json();
      return data?.issues || [];
    },
    [jid]
  );

  const toJsonArray = (value) => {
    if (!value) return "[]";

    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return value; // It was already a JSON array string
      } catch (e) {
        // Not a JSON string, treat as comma-separated
      }

      return JSON.stringify(
        value
          .split(",") // split by comma
          .map((v) => v.trim()) // remove spaces
          .filter((v) => v.length > 0) // remove empty items
      );
    }

    return "[]"; // Fallback
  };

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

  /** Prefill when editing */
  useEffect(() => {
    if (!isEdit || !(idParam || articleIdParam)) return;

    const fetchExistingArticle = async () => {
      try {
        const res = await fetch(
          `/api/articles?${
            idParam ? `id=${idParam}` : `article_id=${articleIdParam}`
          }`
        );
        const json = await res.json();
        if (!json.success || !json.article) return;

        const a = json.article;

        setForm((prev) => ({
          ...prev,
          id: a.id || "",
          article_status: a.article_status || "unpublished",
          journal_id: String(a.journal_id || jid || ""),
          volume_id: String(a.volume_id || ""),
          issue_id: String(a.issue_id || ""),
          month_from: a.month_from || "",
          month_to: a.month_to || "",
          article_id: a.article_id || "",
          doi: a.doi || "",
          article_title: a.article_title || "",
          authors: normalizeArrayField(a.authors),
          abstract: a.abstract || "",
          keywords: normalizeArrayField(a.keywords),
          page_from: a.page_from || "",
          page_to: a.page_to || "",
          references: a.references || "",
          received: a.received || "",
          revised: a.revised || "",
          accepted: a.accepted || "",
          published: a.published || "",
          pdf_path: a.pdf_path || "",
        }));

        // Prefill dependent metadata (issues/months)
        if (a.volume_id) {
          const issues = await fetchIssuesByVolume(a.volume_id, a.issue_id);
          setIssuesMeta(issues);
        }

        monthsWerePrefilledRef.current = true;
      } catch (err) {
        console.error("❌ Prefill error:", err);
      }
    };

    fetchExistingArticle();
  }, [isEdit, idParam, articleIdParam, jid, fetchIssuesByVolume]);

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

  const onSubmit = async (formValuesFromChild) => {
    try {
      setSubmitting(true);

      // 🔹 Always trust the final values from ArticleForm
      const merged = { ...form, ...formValuesFromChild };

      // 🔥 CLEAN ABSTRACT + REFERENCES (remove Word fonts, spans, inline styles)
      merged.abstract = DOMPurify.sanitize(merged.abstract || "", {
        ALLOWED_TAGS: ["p", "b", "i", "u", "ul", "ol", "li", "br"],
        ALLOWED_ATTR: [],
      });

      merged.references = DOMPurify.sanitize(merged.references || "", {
        ALLOWED_TAGS: ["p", "b", "i", "u", "ul", "ol", "li", "br", "a"],
        ALLOWED_ATTR: ["href", "target"],
      });

      // 🔥 Convert authors + keywords into JSON array here
      merged.authors = toJsonArray(merged.authors);
      merged.keywords = toJsonArray(merged.keywords);

      // Basic validation
      if (!merged.article_id || !merged.volume_id || !merged.issue_id) {
        alert("Volume, Issue, and Article ID are required.");
        setSubmitting(false);
        return;
      }

      // 🔹 Auto-fill DOI only
      const jr = journals.find(
        (j) => String(j.id) === String(merged.journal_id)
      );
      if (jr && merged.article_id) {
        const prefix = jr.doi_prefix?.replace(/\/$/, "") || "";
        if (prefix) {
          merged.doi = `${prefix}/${merged.article_id}`;
        }
      }

      // const fd = new FormData();
      // Object.entries(merged).forEach(([k, v]) => {
      //   if (k === "id" && !merged.id) return;
      //   fd.append(k, v ?? "");
      // });

      // if (pdfFile) fd.append("pdf", pdfFile);

      // Build FormData
      const fd = new FormData();

      Object.entries(merged).forEach(([k, v]) => {
        if (k === "id" && !merged.id) return;
        if (k === "remove_pdf") return; // avoid double append
        fd.append(k, v ?? "");
      });

      // 🔥 Make sure remove flag is sent
      if (merged.remove_pdf === "1") {
        fd.append("remove_pdf", "1");
      }

      // Only upload new file if selected
      if (pdfFile) {
        fd.append("pdf", pdfFile);
      }

      
      const method = merged.id ? "PUT" : "POST";
      const res = await fetch("/api/articles", { method, body: fd });
      const data = await res.json();

      if (!res.ok || !data?.success)
        throw new Error(data.message || "Save failed");

      alert(
        merged.id
          ? "Article updated successfully."
          : "Article created successfully."
      );

      if (!merged.id) {
        // ADD SUCCESS
        setPdfFile(null); // <-- VERY IMPORTANT
        setForm({ ...resetForm, journal_id: jid || "" });
        setResetSignal(Date.now()); // triggers form reset
      } else {
        // EDIT SUCCESS
        setPdfFile(null);
        setForm({ ...resetForm, journal_id: jid || "" });
        setResetSignal(Date.now());
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Article" : "Add Article"}
        </h1>

        {/* ⭐ BACK TO ARCHIVES BUTTON */}
        <button
          onClick={() => {
            const jr = journals.find((j) => j.id === Number(jid));
            if (!jr) return alert("Journal not found.");
            const shortName = encodeURIComponent(jr.short_name);

            router.push(
              `/admin/dashboard/journals/${shortName}/archives?jid=${jid}`
            );
          }}
          className="flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition cursor-pointer"
        >
          Back to Archives
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <ArticleForm
        formData={form}
        journals={journals}
        volumesMeta={volumesMeta}
        fetchIssuesByVolume={fetchIssuesByVolume}
        defaultJournalId={jid}
        disabledJournal={true}
        onSubmit={onSubmit} // child will call with form data
        submitting={submitting}
        onFileSelect={onFileSelect}
        selectedFile={pdfFile}
        resetSignal={resetSignal} // 👈 added
        isEdit={isEdit} // ✅ add this line
      />
    </div>
  );
}
