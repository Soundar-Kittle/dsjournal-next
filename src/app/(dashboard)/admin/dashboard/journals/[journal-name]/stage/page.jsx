// src/app/(dashboard)/dashboard/journals/[journal-name]/stage/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import CKEditorField from "@/components/Dashboard/Journals/Article/CKEditorField";
import ActionMenu from "@/components/Dashboard/Stage/ActionMenu";

/** Util */
const cls = (...a) => a.filter(Boolean).join(" ");
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");

function safeJson(str, fallback = []) {
  try {
    return JSON.parse(str || "[]");
  } catch {
    return fallback;
  }
}

/* ---------- Inputs ---------- */
function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <textarea
        rows={rows}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* ---------- Upload Box ---------- */
function UploadBox({ onDone, jidFromUrl, journalName }) {
  const [file, setFile] = useState(null);
  const [journalId, setJournalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (jidFromUrl && !journalId) setJournalId(String(jidFromUrl));
  }, [jidFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || !journalId) {
      setMsg("Select a DOCX and enter journal_id");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("journal_id", journalId);

      const r = await fetch("/api/articles/stage", {
        method: "POST",
        body: fd,
      });
      const j = await r.json();

      if (!r.ok || !j.success) {
        setMsg(j.message || "Upload failed");
        return;
      }

      setMsg(`Extracted: ${j.extracted_preview?.title || ""}`);
      setFile(null);
      onDone?.();
    } catch (err) {
      setMsg(String(err.message || err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-700">DOCX file</label>
          <input
            type="file"
            accept=".docx"
            className="mt-1 w-full rounded-md border p-2 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <label className="block">
          <span className="text-sm text-gray-700">Journal</span>
          <input
            type="text"
            value={journalName || journalId}
            disabled
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-gray-100 text-gray-600"
          />
          <input type="hidden" value={journalId} />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          disabled={busy}
          className={cls(
            "rounded-md bg-black px-4 py-2 text-sm text-white",
            busy && "opacity-60"
          )}
        >
          {busy ? "Uploading…" : "Upload & Extract"}
        </button>
        {msg && (
          <span
            className={`text-sm ${
              msg.startsWith("Upload blocked")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}

/* ---------- Authors Editor ---------- */
function AuthorsEditor({ value = [], onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const name = draft.trim();
    if (name) onChange([...(value || []), name]);
    setDraft("");
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div>
      <span className="text-sm text-gray-700">Authors (ordered)</span>
      <div className="mt-1 flex gap-2">
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Add author name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border px-3 text-sm"
        >
          Add
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(value || []).map((n, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
          >
            {i + 1}. {n}
            <button
              type="button"
              className="text-gray-500 hover:text-red-600"
              onClick={() => remove(i)}
              aria-label="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- References Editor ---------- */
function ReferencesEditor({ value = [], onChange }) {
  const [txt, setTxt] = useState((value || []).join("\n"));
  useEffect(() => setTxt((value || []).join("\n")), [value]);
  return (
    <TextArea
      label="References (one per line)"
      rows={8}
      value={txt}
      onChange={(v) => {
        setTxt(v);
        onChange(
          v
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }}
      placeholder="[1] …\n[2] …"
    />
  );
}

/* ---------- Review Modal ---------- */
function ReviewModal({ open, onClose, stagedId, onApproved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const [row, setRow] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [refs, setRefs] = useState([]);

  // Always show correct local date in <input type="date">
function toLocalDateString(dateStr) {
  if (!dateStr) return "";
  // if it's already YYYY-MM-DD, keep it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
 const day = String(local.getDate()).padStart(2, "0");
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const year = local.getFullYear();
  return `${day}/${month}/${year}`;
}

// ---- Date Helpers ----
function normalizeDate(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // already fine
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

function formatDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

useEffect(() => {
  if (!open || !stagedId) return;

  (async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/articles/stage/${stagedId}`);
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to load");

      const record = j.staged || j.record || j.item || j.data || null;
      if (!record) throw new Error("No record found");

      console.log("object", record);

      setRow({
        ...record,
        received_date: normalizeDate(record.received_date),
        revised_date: normalizeDate(record.revised_date),
        accepted_date: normalizeDate(record.accepted_date),
        published_date: normalizeDate(record.published_date),
      });

      setAuthors(
        Array.isArray(record.authors)
          ? record.authors
          : safeJson(record.authors, [])
      );
      setRefs(
        typeof record.references === "string"
          ? record.references
          : record.refs || ""
      );
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  })();
}, [open, stagedId]);

  const updateStaged = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/articles/stage/${stagedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row.title,
          abstract: row.abstract,
          keywords: row.keywords,
          pages_from: row.pages_from,
          pages_to: row.pages_to,
          received_date: row.received_date,
          revised_date: row.revised_date,
          accepted_date: row.accepted_date,
          published_date: row.published_date,
          article_id: row.article_id,
          authors, // array from AuthorsEditor
          doi: row.doi,
          volume_number: row.volume_number,
          issue_number: row.issue_number,
          year: row.year,
          references: refs, // CKEditor HTML
        }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Save failed");
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

const accept = async () => {
  if (!stagedId) return;

  // ask for PDF
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf";
  input.click(); // 👈 opens file picker when Approve is clicked

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return alert("Please select a PDF file to approve.");

    // upload PDF via FormData
    setPromoting(true);
    try {
      const fd = new FormData();
      fd.append("status", "approved");
      fd.append("file", file);

      const r = await fetch(`/api/articles/stage/${stagedId}/status`, {
        method: "PUT",
        body: fd,
      });

      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.message || "Approval failed");

      alert("✅ Approved & PDF uploaded");
      onApproved?.(j);
      onClose();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setPromoting(false);
    }
  };
};
  const reject = async () => {
    if (!stagedId) return;
    setPromoting(true);
    try {
      const r = await fetch(`/api/articles/stage/${stagedId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Reject failed");
      onApproved?.(j);
      onClose();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div
      className={cls(
        "fixed inset-0 z-50 bg-black/40 transition",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className="absolute inset-y-0 right-0 w-full sm:w-[600px] md:w-[720px] lg:w-[800px] max-w-[100vw] bg-white p-5 shadow-xl overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Review & Approve</h2>
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-gray-600">Loading…</div>
        ) : row ? (
          <div className="mt-4 grid gap-6">
            {/* === Article Details Section === */}
            <section className="w-full max-w-[720px]">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Article Details
              </h3>
              <TextInput
                label="Article ID"
                value={row.article_id || ""}
                onChange={(v) => setRow({ ...row, article_id: v })}
              />
              <TextInput
                label="Title"
                value={row.title || ""}
                onChange={(v) => setRow({ ...row, title: v })}
              />
              {/* <TextArea
                label="Abstract"
                value={row.abstract || ""}
                onChange={(v) => setRow({ ...row, abstract: v })}
                rows={6}
              /> */}
              <div>
                <span className="text-sm text-gray-700">Abstract</span>
                <CKEditorField
                  value={row.abstract || ""}
                  onChange={(html) => setRow({ ...row, abstract: html })}
                  placeholder="Enter abstract here..."
                />
              </div>

              <TextInput
                label="Keywords"
                value={row.keywords || ""}
                onChange={(v) => setRow({ ...row, keywords: v })}
              />
            </section>

            {/* === Authors Section === */}
            <section className="w-full max-w-[720px]">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Authors
              </h3>
              <AuthorsEditor value={authors} onChange={setAuthors} />
            </section>

            {/* === References Section === */}
            <section className="w-full max-w-[720px] ml-auto pr-2">
              <CKEditorField
                value={refs || ""}
                onChange={(html) => setRefs(html)} // full HTML
                placeholder="Enter references here…"
              />
            </section>

<section className="w-full max-w-[720px]">
  <h3 className="text-base font-semibold text-gray-700 mb-2">Dates</h3>
  
  <div className="grid grid-cols-2 gap-3">
    {[
      ["Received Date", "received_date"],
      ["Revised Date", "revised_date"],
      ["Accepted Date", "accepted_date"],
      ["Published Date", "published_date"],
    ].map(([label, key]) => (
      <div key={key} className="flex flex-col relative">
        <label className="text-sm text-gray-700 mb-1">{label}</label>

        <div className="relative">
          {/* Hidden native input (real date picker) */}
        <input
  type="date"
  id={`${key}-picker`}
  className="absolute inset-0 opacity-0 cursor-pointer z-10"
  value={normalizeDate(row[key])}
  onChange={(e) => setRow({ ...row, [key]: e.target.value })}
/>

<input
  type="text"
  readOnly
  className="w-full rounded-md border px-3 py-2 text-sm bg-white cursor-pointer"
  value={formatDDMMYYYY(row[key])}
  placeholder="dd/mm/yyyy"
  onClick={() =>
    document.getElementById(`${key}-picker`)?.showPicker?.()
  }
/>

          {/* Calendar icon clickable */}
          <span
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer z-20"
            onClick={() =>
              document.getElementById(`${key}-picker`)?.showPicker?.()
            }
          >
            📅
          </span>
        </div>
      </div>
    ))}
  </div>
</section>

            {/* === Actions Section === */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={updateStaged}
                disabled={saving}
                className={cls(
                  "rounded-md border px-4 py-2 text-sm",
                  saving && "opacity-60"
                )}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={accept}
                disabled={promoting}
                className={cls(
                  "rounded-md bg-green-600 px-4 py-2 text-sm text-white",
                  promoting && "opacity-60"
                )}
              >
                {promoting ? "Accepting…" : "Accept"}
              </button>
              <button
                type="button"
                onClick={reject}
                disabled={promoting}
                className={cls(
                  "rounded-md bg-red-600 px-4 py-2 text-sm text-white",
                  promoting && "opacity-60"
                )}
              >
                {promoting ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-sm text-gray-600">No data.</div>
        )}
      </div>
    </div>
  );
}

/* ---------- Main Dashboard ---------- */
export default function StagingDashboard() {
  const searchParams = useSearchParams();
  const { ["journal-name"]: journalName } = useParams();

  const jid = searchParams.get("jid");

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("extracted");
  const [loading, setLoading] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL(`/api/articles/stage`, window.location.origin);
      url.searchParams.set("status", status);
      if (jid) url.searchParams.set("jid", jid);
      const r = await fetch(url.toString());
      const j = await r.json();
      setRows(j.records || j.staged || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this staged article?")) return;
    try {
      const r = await fetch(`/api/articles/stage/${id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.message || "Delete failed");
      alert("Deleted successfully");
      load(); // refresh list
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  useEffect(() => {
    load();
  }, [status, jid]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">
        Articles — Staging Dashboard
      </h1>
      <div className="mb-4 text-xs text-gray-600">
        Journal: <span className="font-mono">{journalName || "-"}</span>
        {" · "}JID: <span className="font-mono">{jid || "—"}</span>
      </div>

      <div className="mb-6 grid gap-4">
        <UploadBox onDone={load} jidFromUrl={jid} journalName={journalName} />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["uploaded", "extracted", "reviewing", "approved", "rejected"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cls(
                    "rounded-full border px-3 py-1 text-sm",
                    status === s && "bg-black text-white"
                  )}
                >
                  {s}
                </button>
              )
            )}
          </div>
          <button onClick={load} className="text-sm underline">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border relative">
          <table className="min-w-full text-sm relative z-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Article ID</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Journal</th>
                <th className="px-3 py-2 text-left">Pages</th>
                <th className="px-3 py-2 text-left">Dates</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-3" colSpan={8}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-gray-600" colSpan={8}>
                    No items.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2 font-mono">
                      {r.article_id || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {r.title?.slice(0, 80) || "-"}
                    </td>
                    <td className="px-3 py-2">{r.journal_id}</td>
                    <td className="px-3 py-2">
                      {r.pages_from ?? "-"}–{r.pages_to ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-gray-700">
                        <div>Rec: {fmt(r.received_date)}</div>
                        <div>Acc: {fmt(r.accepted_date)}</div>
                        <div>Pub: {fmt(r.published_date)}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="relative inline-block text-left action-menu z-50">
                        <ActionMenu
                          onEdit={() => setReviewId(r.id)}
                          onDelete={() => handleDelete(r.id)}
                          onApprove={
                            r.status === "reviewing"
                              ? () => handleApprove(r.id)
                              : undefined
                          }
                          showApprove={r.status === "reviewing"}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewModal
        open={!!reviewId}
        stagedId={reviewId}
        onClose={() => setReviewId(null)}
        onApproved={() => {
          setReviewId(null);
          load();
        }}
      />
    </div>
  );
}
