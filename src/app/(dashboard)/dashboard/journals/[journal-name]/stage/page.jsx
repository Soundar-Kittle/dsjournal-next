// stage/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

/** Util */
const cls = (...a) => a.filter(Boolean).join(" ");
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");


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
function UploadBox({ onDone, jidFromUrl }) {
  const [file, setFile] = useState(null);
  const [journalId, setJournalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Default the journal id from `jid` query param
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
      const r = await fetch("/api/articles/stage", { method: "POST", body: fd });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Upload failed");
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
        <TextInput
          label="Journal ID"
          value={journalId}
          onChange={setJournalId}
          placeholder="e.g. 1"
        />
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
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
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
          placeholder="Add author name (markers like 1* removed on promote)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button type="button" onClick={add} className="rounded-md border px-3 text-sm">
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
      label="References (one per line, CrossRef/GS/Publisher tails ok)"
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
function ReviewModal({ open, onClose, stagedId, onApproved, journals = [] }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // fields
  const [row, setRow] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [refs, setRefs] = useState([]);

  // dropdowns
  const [journalId, setJournalId] = useState("");
  const [journalShort, setJournalShort] = useState("");
  const [volumeId, setVolumeId] = useState("");
  const [issueId, setIssueId] = useState("");
  const [volumes, setVolumes] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (!open || !stagedId) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/staged/${stagedId}`);
        const j = await r.json();
        if (!j.success) throw new Error(j.message || "Failed to load");
        setRow(j.staged);
        setAuthors((j.authors || []).map((a) => a.full_name || a));
        setRefs((j.references || []).map((r) => r.raw_citation || r));
        setJournalId(String(j.staged.journal_id || ""));
        setJournalShort(j.staged.journal_short || "");
        if (j.staged.journal_id) {
          const [v, i] = await Promise.all([
            fetch(`/api/volumes?journal_id=${j.staged.journal_id}`).then((r) => r.json()),
            fetch(`/api/issues?journal_id=${j.staged.journal_id}`).then((r) => r.json()),
          ]);
          setVolumes(v.records || v.volumes || []);
          setIssues(i.records || i.issues || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, stagedId]);

  const updateStaged = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/staged/${stagedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row.title,
          keywords: row.keywords,
          pages_from: row.pages_from,
          pages_to: row.pages_to,
          received_date: row.received_date,
          revised_date: row.revised_date,
          accepted_date: row.accepted_date,
          published_date: row.published_date,
          article_id: row.article_id,
          authors,
          references: refs,
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

  const approve = async () => {
    if (!issueId || !volumeId) {
      alert("Select volume and issue");
      return;
    }
    setPromoting(true);
    try {
      const r = await fetch("/api/articles/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staged_article_id: stagedId,
          journal_id: Number(journalId),
          volume_id: Number(volumeId),
          issue_id: Number(issueId),
          month_from: row.month_from ?? null,
          month_to: row.month_to ?? null,
          page_from: row.pages_from ?? null,
          page_to: row.pages_to ?? null,
          pdf_path: row.storage_path ?? null,
          article_status: "unpublished",
          journal_short: journalShort || undefined,
        }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Promote failed");
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
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Review & Approve</h2>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-gray-600">Loading…</div>
        ) : row ? (
          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Journal ID" value={journalId} onChange={setJournalId} />
              <TextInput label="Journal Short (for article_id fallback)" value={journalShort} onChange={setJournalShort} />
              <label className="block">
                <span className="text-sm text-gray-700">Volume</span>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={volumeId}
                  onChange={(e) => setVolumeId(e.target.value)}
                >
                  <option value="">Select volume</option>
                  {volumes.map((v) => (
                    <option key={v.id} value={v.id}>
                      V{v.volume_number} ({v.year})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Issue</span>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={issueId}
                  onChange={(e) => setIssueId(e.target.value)}
                >
                  <option value="">Select issue</option>
                  {issues.map((i) => (
                    <option key={i.id} value={i.id}>
                      Issue {i.issue_number}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <TextInput label="Article ID" value={row.article_id || ""} onChange={(v) => setRow({ ...row, article_id: v })} placeholder="e.g., DST-V4I2P104" />
            <TextInput label="Title" value={row.title || ""} onChange={(v) => setRow({ ...row, title: v })} />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Pages From" value={row.pages_from ?? ""} onChange={(v) => setRow({ ...row, pages_from: v })} />
              <TextInput label="Pages To" value={row.pages_to ?? ""} onChange={(v) => setRow({ ...row, pages_to: v })} />
            </div>

            <TextArea label="Abstract" value={row.abstract || ""} onChange={(v) => setRow({ ...row, abstract: v })} rows={6} />
            <TextInput label="Keywords (comma separated)" value={row.keywords || ""} onChange={(v) => setRow({ ...row, keywords: v })} />

            <AuthorsEditor value={authors} onChange={setAuthors} />
            <ReferencesEditor value={refs} onChange={setRefs} />

            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Received" value={row.received_date || ""} onChange={(v) => setRow({ ...row, received_date: v })} placeholder="YYYY-MM-DD" />
              <TextInput label="Revised" value={row.revised_date || ""} onChange={(v) => setRow({ ...row, revised_date: v })} placeholder="YYYY-MM-DD" />
              <TextInput label="Accepted" value={row.accepted_date || ""} onChange={(v) => setRow({ ...row, accepted_date: v })} placeholder="YYYY-MM-DD" />
              <TextInput label="Published" value={row.published_date || ""} onChange={(v) => setRow({ ...row, published_date: v })} placeholder="YYYY-MM-DD" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={updateStaged}
                disabled={saving}
                className={cls("rounded-md border px-4 py-2 text-sm", saving && "opacity-60")}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={approve}
                disabled={promoting}
                className={cls("rounded-md bg-black px-4 py-2 text-sm text-white", promoting && "opacity-60")}
              >
                {promoting ? "Approving…" : "Approve & Promote"}
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

  const jid = searchParams.get("jid"); // string | null

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("extracted"); // uploaded|extracted|reviewing|approved|rejected
  const [loading, setLoading] = useState(false);
  const [reviewId, setReviewId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL(`/api/staged`, window.location.origin);
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

  useEffect(() => { load(); }, [status, jid]); // reload when jid or status changes

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Articles — Staging Dashboard</h1>
      <div className="mb-4 text-xs text-gray-600">
        Journal: <span className="font-mono">{journalName || "-"}</span>
        {" · "}
        JID: <span className="font-mono">{jid || "—"}</span>
      </div>

      {!jid && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
          Missing <code>?jid=</code> in URL. Some API calls may fail. Add e.g. <code>?jid=4</code>.
        </div>
      )}

      <div className="mb-6 grid gap-4">
        <UploadBox onDone={load} jidFromUrl={jid} />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["uploaded","extracted","reviewing","approved","rejected"].map((s) => (
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
            ))}
          </div>
          <button onClick={load} className="text-sm underline">Refresh</button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
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
                <tr><td className="px-3 py-3" colSpan={8}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-gray-600" colSpan={8}>No items.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2 font-mono">{r.article_id || "-"}</td>
                    <td className="px-3 py-2">{r.title?.slice(0, 80) || "-"}</td>
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
                    <td className="px-3 py-2">
                      <button
                        className="rounded-md border px-3 py-1 text-xs"
                        onClick={() => setReviewId(r.id)}
                      >
                        Review
                      </button>
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
        onApproved={() => { setReviewId(null); load(); }}
      />
    </div>
  );
}
