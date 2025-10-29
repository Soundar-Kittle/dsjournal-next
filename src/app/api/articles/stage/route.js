// /api/articles/stage/route.js

import { NextResponse } from "next/server";
import { createDbConnection } from "@/lib/db";
import mammoth from "mammoth";
import JSZip from "jszip";
import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";

import he from "he"; // if you don't have it, `npm i he`
export const dynamic = "force-dynamic";

/* ───────── helpers for references ───────── */

const safeJson = (v, fallback = []) => {
  if (v == null || v === "") return fallback;
  try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return fallback; }
};



function textOnly(html) {
  return he.decode(String(html || "").replace(/<[^>]*>/g, " "));
}

function labelForHref(href, anchorText = "") {
  const t = anchorText.trim();
  const h = href.toLowerCase();
  if (/crossref/i.test(t) || h.includes("doi.org")) return "CrossRef";
  if (/google scholar/i.test(t) || h.includes("scholar.google")) return "Google Scholar";
  if (/pubmed/i.test(t) || h.includes("pubmed.ncbi.nlm.nih.gov")) return "PubMed";
  if (/pmc/i.test(t) || /ncbi.nlm.nih.gov\/pmc/.test(h) || /pmc.ncbi.nlm.nih.gov/.test(h)) return "PMC";
  if (/arxiv/i.test(t) || h.includes("arxiv.org")) return "arXiv";
  return "Publisher Link";
}




/** Robustly extract arrays of anchors for each reference item
 * Returns: Array< Array<{href,label}> >
 */
async function extractRefAnchorsPerItem(buffer) {
  const { value: html } = await mammoth.convertToHtml({ buffer });

  // 1) Find a tolerant "References" or "Bibliography" heading (<p> or <h1..h6>, optional colon)
  const headingRx = /<(?:p|h[1-6])[^>]*>\s*(?:references|bibliography)\s*:?\s*<\/(?:p|h[1-6])>/i;
  const mHead = headingRx.exec(html);
  const startIdx = mHead ? mHead.index + mHead[0].length : 0;
  const after = html.slice(startIdx);

  // 2) Prefer first <ol> or <ul> after heading
  const listMatch = after.match(/<(ol|ul)\b[\s\S]*?<\/\1>/i);
  let blocks = [];
  if (listMatch) {
    const listHtml = listMatch[0];
    blocks = [...listHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1]);
  } else {
    // 3) Fallback to numbered-paragraph grouping ([1]... / 1. ...)
    const paras = [...after.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1]);
    const items = [];
    let cur = "";
    const startsRef = (s) => /^\s*(?:\[\d+\]|\d+\.)\s*/.test(textOnly(s));
    for (const p of paras) {
      if (startsRef(p)) {
        if (cur) items.push(cur);
        cur = p;
      } else {
        cur += cur ? " " + p : p;
      }
    }
    if (cur) items.push(cur);
    blocks = items;
  }

  if (!blocks.length) return null;

  // 4) Pull anchors per item and normalize labels
  return blocks.map(htmlChunk => {
    const anchors = [];
    const aRx = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const seen = new Set();
    let a;
    while ((a = aRx.exec(htmlChunk))) {
      const href = a[1];
      const txt = textOnly(a[2]).trim();
      if (!href || seen.has(href)) continue;
      seen.add(href);
      anchors.push({ href, label: labelForHref(href, txt) });
    }
    return anchors;
  });
}

/* ───────── generic utils ───────── */
const safeInt = (v) =>
  v === null || v === undefined || v === "" ? null : Number.isFinite(+v) ? +v : null;
const num = (v) => (v == null ? null : parseInt(v, 10));
const normalizeUnicode = (s = "") =>
  s
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/\u200B/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[\u2215\u2044\uFF0F]/g, "/")
    .replace(/[\u2236\uFF1A]/g, ":");
const normalizeDash = (s = "") => s.replace(/[–—]/g, "-");
const splitLines = (t = "") => normalizeUnicode(t).replace(/\r/g, "").split("\n").map((s) => s.trim());
const cleanAuthor = (s = "") => normalizeUnicode(s).replace(/\b\d+[*]?\b/g, "").replace(/\s+/g, " ").trim();
const slugifyBaseName = (name) =>
  name.toLowerCase().replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");

/* detectors */
const DOI_RX = /\b10\.\d{4,9}\/[^\s"'()\]\[<>]+/i;

/* strip any already-embedded chips from plaintext */
function stripOldChips(s = "") {
  return String(s)
    .replace(/\s*\[(?:CrossRef|Google Scholar|PubMed|PMC|arXiv|DOI|Publisher Link|Generic URL)\]\s*/gi, "")
    .trim();
}
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* reference context (doi + explicit urls present) */
function makeRefCtx(refText) {
  const cleaned = stripOldChips(String(refText || ""));
  const doiHit = DOI_RX.exec(cleaned);
  const doi = doiHit ? doiHit[0].replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "") : null;
  const doi_url = doi ? `https://doi.org/${doi}` : null;

  const URLS_RX = /(https?:\/\/[^\s"'<>\]]+)/gi; // fresh each call
  const urls = [];
  let m;
  while ((m = URLS_RX.exec(cleaned))) {
    let u = m[1].replace(/[).,;:]+$/, "");
    try {
      const parsed = new URL(u);
      urls.push({
        url: u,
        host: parsed.hostname.toLowerCase(),
        path: (parsed.pathname || "").toLowerCase(),
      });
    } catch {}
  }
  return { doi, doi_url, urls };
}

/* Remove crumbs like "2" lines after slicing */
function sanitizeRefs(refs = []) {
  const out = [];
  for (const raw of refs) {
    const s = String(raw || "").replace(/\s+/g, " ").trim();
    if (!s) continue;
    if (/^\d{1,4}$/.test(s)) continue;
    if (!/[A-Za-z]/.test(s)) continue;
    out.push(s);
  }
  return out;
}

/* CK-styled green chip */
function chipCk(label, href) {
  if (!href) return "";
  return ` [<a target="_blank" rel="noopener noreferrer" href="${href}">
    <span style="color:#00B050;font-family:&quot;Palatino Linotype&quot;,&quot;serif&quot;;font-size:9.0pt;">
      <span style="line-height:115%;text-decoration:none;text-underline:none;" lang="EN-US" dir="ltr">${label}</span>
    </span>
  </a>]`;
}

/* STRICT: emit chips only for things present in the reference text */
function chipsFromAnchors(anchors = []) {
  if (!anchors.length) return "";
  return anchors.map(a => chipCk(a.label || "Link", a.href)).join("");
}

// Build chips from *all* URLs we can see in the reference text (no allow-list)
// Use EVERY url we can see in the reference text (plus DOI→CrossRef), no DB checks
function chipsFromTextNoAllow(refText = "") {
  const cleaned = stripOldChips(String(refText || ""));
  const used = new Set();
  const chips = [];

  // DOI → CrossRef chip
  const doiHit = DOI_RX.exec(cleaned);
  if (doiHit) {
    const doi = doiHit[0].replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
    const doiUrl = `https://doi.org/${doi}`;
    if (!used.has(doiUrl)) {
      used.add(doiUrl);
      chips.push(chipCk("CrossRef", doiUrl));
    }
  }

  // All other links present
  const URLS_RX = /(https?:\/\/[^\s"'<>\]]+)/gi;
  let m;
  while ((m = URLS_RX.exec(cleaned))) {
    let href = m[1].replace(/[).,;:]+$/, "");
    try {
      const u = new URL(href);
      if (used.has(u.href)) continue;
      used.add(u.href);
      chips.push(chipCk(labelForHref(u.href), u.href));
    } catch {}
  }
  return chips.join("");
}



/* Split refs smartly from plaintext lines */
function splitReferencesSmart(lines = []) {
  const arr = (lines || []).map((s) => String(s || "").trim()).filter(Boolean);
  const text = arr.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return [];

  // 1) Inline markers: [1] or "1."
  const byMarkers = text
    .split(/(?=\s*(?:\[\d+\]|\d+\.)\s*)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byMarkers.length > 1) {
    return byMarkers.map((s) => s.replace(/^(?:\[\d+\]|\d+\.)\s*/, "").trim());
  }

  // 2) Year + period, then authors
  const byYearDot = text
    .split(/(?<=\b(?:19|20)\d{2}\.)\s+(?=[A-Z][A-Za-z.\- ]+,)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byYearDot.length > 1) return byYearDot;

  // 3) Year + semicolon
  const byYearSemi = text
    .split(/(?<=\b(?:19|20)\d{2};)\s+(?=[A-Z][A-Za-z.\- ]+,)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byYearSemi.length > 1) return byYearSemi;

  // 4) Fallback
  const naive = text
    .split(/(?<=\.)\s+(?=[A-Z][A-Za-z.\- ]+,)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return naive.length > 1 ? naive : [text];
}

/* Render an entire <h3>References</h3><ol>…</ol> block with numbered bullets */
/* Render ONLY a numbered <ol>…</ol> (no “References” title). */
/* Numbered like [1], chips at end of the SAME line, no "References" heading */
function refsArrayToCkHtml(refs = [], _unused = null, anchorsPerItem = null) {
  const items = refs.map((rRaw, idx) => {
    const n = idx + 1;
    const body = escapeHtml(stripOldChips(rRaw));

    // Prefer anchors extracted from DOCX; else use all URLs from plaintext
    let chipsHtml = "";
    if (anchorsPerItem && anchorsPerItem[idx] && anchorsPerItem[idx].length) {
      chipsHtml = chipsFromAnchors(anchorsPerItem[idx]);   // uses your green chip style
    } else {
      chipsHtml = chipsFromTextNoAllow(rRaw);
    }

    // One paragraph: [n] + reference text + chips at end
    const line =
`<p style="line-height:1.15;margin:.1pt 0 .0001pt 0;text-align:justify;">
  <span style="font-family:&quot;Palatino Linotype&quot;,&quot;serif&quot;;font-size:9.0pt;">
    <span style="line-height:115%;" lang="EN-US" dir="ltr">
      <strong>[${n}]</strong> ${body}${chipsHtml ? " " + chipsHtml : ""}
    </span>
  </span>
</p>`;

    // Hide native list marker and keep CK sizing
    return `
<li class="ck-list-marker-font-size"
    style="--ck-content-list-marker-font-size:9.0pt; list-style:none; margin-left:0;"
    data-list-item-id="ref-${n}">
  ${line}
</li>`.trim();
  });

  // Semantic <ol>, but we hide the default markers and provide our own [n]
  return `<ol style="padding-left:0; margin-left:0; list-style:none;">\n${items.join("\n")}\n</ol>`;
}


/* ───────── filename/header helpers (unchanged except where noted) ───────── */
function parseArticleIdFromFilename(name = "") {
  const base = name.replace(/\.[^.]+$/i, "");
  let m = base.match(/([A-Z]{2,15})[-_]?V(\d+)[-_]?I(\d+)[-_]?P(\d+)/i);
  if (m) {
    const [, j, v, i, p] = m;
    const seq = String(parseInt(p, 10)).padStart(3, "0");
    return { article_id: `${j.toUpperCase()}-V${+v}I${+i}P${seq}`, volume_number: +v, issue_number: +i };
  }
  m = base.match(/V(\d+)[-_]?I(\d+)[-_]?P(\d+)/i);
  if (m) {
    const [, v, i, p] = m;
    const seq = String(parseInt(p, 10)).padStart(3, "0");
    return { article_id: `V${+v}I${+i}P${seq}`, volume_number: +v, issue_number: +i };
  }
  return null;
}

function stripXmlTags(xml = "") {
  return xml
    .replace(/<w:tab\/>/g, " ")
    .replace(/<w:br\/?>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
async function readHeaderFooterTextFromDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const parts = [];
  for (const name of Object.keys(zip.files)) {
    if (/^word\/(header|footer)\d*\.xml$/i.test(name)) {
      try { parts.push(stripXmlTags(await zip.file(name).async("string"))); } catch {}
    }
  }
  return normalizeUnicode(parts.join("\n"));
}

/* ───────── parsers for vol/issue/pages/dates (unchanged) ───────── */
const MONTHS = { jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12 };

function parseVolIssueAnywhere(text = "") {
  const t = normalizeDash(text);
  let m = /(?:Volume|Vol\.?)\s*(\d+)\s*(?:,|\s)*\s*(?:Issue|No\.?)\s*(\d+)/i.exec(t);
  if (m) return { volume_number: num(m[1]), issue_number: num(m[2]) };
  m = /\bV(?:ol\.?)?\s*(\d+)\b[^\n]{0,15}?\bI(?:ss\.?|sue)?\s*(\d+)\b/i.exec(t);
  if (m) return { volume_number: num(m[1]), issue_number: num(m[2]) };
  m = /(?:Issue|No\.?)\s*(\d+)[^\n]{0,40}?(?:Volume|Vol\.?)\s*(\d+)/i.exec(t);
  if (m) return { volume_number: num(m[2]), issue_number: num(m[1]) };
  return {};
}

const HEADER_MAX_LINES = 25;
const VOL_ISSUE_SCAN_LIMIT = 120;

function getHeaderText(lines = []) {
  const iStop = lines.findIndex((l) => /^Original Article$/i.test(l));
  const head = lines.slice(0, iStop > -1 ? Math.min(iStop, HEADER_MAX_LINES) : HEADER_MAX_LINES);
  return head.join("\n");
}

function findFirstVolIssueIndex(lines = [], limit = VOL_ISSUE_SCAN_LIMIT) {
  const n = Math.min(lines.length, limit);
  for (let i = 0; i < n; i++) {
    const s = normalizeDash(lines[i] || "");
    if (/(?:Volume|Vol\.?).{0,20}(?:Issue|No\.?)/i.test(s) || /\bV(?:ol\.?)?\s*\d+\b.{0,20}\bI(?:ss\.?|sue)?\s*\d+\b/i.test(s))
      return i;
  }
  return -1;
}

function findPageRangesAround(lines = [], start, before = 2, after = 6) {
  const hits = [];
  if (start < 0) return hits;
  const lo = Math.max(0, start - before);
  const hi = Math.min(lines.length - 1, start + after);
  for (let i = lo; i <= hi; i++) {
    const t = normalizeDash(lines[i] || "");
    const rxs = [
      /\bpp?\.?\s*(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
      /\bPages?\s*[:.]?\s*(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
      /\b(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
    ];
    for (const rx of rxs) {
      let m;
      while ((m = rx.exec(t))) {
        const a = num(m[1]), b = num(m[2]);
        if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
        if (a <= 0 || b <= 0 || a > b) continue;
        if (b - a > 300) continue;
        if (b >= 1800) continue;
        hits.push({ from: a, to: b, line: i, index: m.index });
      }
    }
  }
  return hits;
}

function chooseHeaderPages(header = "") {
  const t = normalizeDash(header);
  const all = [];
  const rxs = [
    /\bpp?\.?\s*(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
    /\bPages?\s*[:.]?\s*(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
    /\b(\d{1,4})\s*-\s*(\d{1,4})\b/gi,
  ];
  for (const rx of rxs) {
    let m;
    while ((m = rx.exec(t))) {
      const a = num(m[1]), b = num(m[2]);
      if (a <= 0 || b <= 0 || a > b) continue;
      if (b - a > 300) continue;
      if (b >= 1800) continue;
      all.push({ from: a, to: b, index: m.index });
    }
  }
  if (!all.length) return {};
  const volPos = t.search(/(?:Volume|Vol\.?|Issue|No\.?)/i);
  if (volPos >= 0) {
    all.sort((x, y) => Math.abs(x.index - volPos) - Math.abs(y.index - volPos) || x.from - y.from);
    return { pages_from: all[0].from, pages_to: all[0].to };
  }
  all.sort((x, y) => x.from - y.from || x.index - y.index);
  return { pages_from: all[0].from, pages_to: all[0].to };
}

function parsePagesBeforeReferences(lines = []) {
  const stop = lines.findIndex((l) => /^References$/i.test(l));
  const seg = (stop > -1 ? lines.slice(0, stop) : lines).join("\n");
  return chooseHeaderPages(seg);
}

function parseDates(line = "") {
  const out = {};
  const rx = /(Received|Revised|Accepted|Published)\s*:\s*([0-3]?\d\s+\w+\s+\d{4})/gi;
  let m;
  while ((m = rx.exec(line))) out[`${m[1].toLowerCase()}_date`] = new Date(m[2]).toISOString().slice(0, 10);
  return out;
}

function parseIssnAndDoiFromHeader(header = "") {
  const rx = /ISSN[^\dA-Za-z]{0,10}([0-9]{4}-[0-9Xx]{4})[\s\S]*?(https?:\/\/(?:dx\.)?doi\.org\/\S+)?/i;
  const m = rx.exec(header);
  const out = { issn: null, doi_url: null };
  if (m) {
    out.issn = (m[1] || "").toUpperCase();
    if (m[2]) out.doi_url = m[2];
  }
  return out;
}
function parseDoiUrlAnywhere(text = "") {
  const url = /(https?:\/\/(?:dx\.)?doi\.org\/\S+)/i.exec(text)?.[1];
  if (url) return url;
  const tok = /\bdoi\s*[:)]?\s*(10\.[^\s)]+)\b/i.exec(text)?.[1];
  if (tok) return `https://doi.org/${tok.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")}`;
  return null;
}

/* ───────── resolve helpers (unchanged) ───────── */
async function resolveJournalId(conn, { url, form }) {
  let jid =
    safeInt(form.get("journal_id")) ??
    safeInt(form.get("jid")) ??
    safeInt(new URL(url).searchParams.get("jid")) ??
    null;
  if (jid !== null) return jid;

  const short_name =
    (form.get("short_name") ||
      form.get("journal_short") ||
      new URL(url).searchParams.get("short_name") ||
      new URL(url).searchParams.get("journal_short") ||
      "")
      .toString()
      .trim();
  const journal_name = (form.get("journal_name") || new URL(url).searchParams.get("journal_name") || "")
    .toString()
    .trim();
  const issn = (form.get("issn") || new URL(url).searchParams.get("issn") || "").toString().trim();

  if (short_name) {
    const [[jr]] = await conn.query("SELECT id FROM journals WHERE short_name=? LIMIT 1", [short_name]);
    if (jr) return jr.id;
  }
  if (journal_name) {
    const [[jr]] = await conn.query("SELECT id FROM journals WHERE journal_name=? LIMIT 1", [journal_name]);
    if (jr) return jr.id;
  }
  if (issn) {
    const [[jr]] = await conn.query("SELECT id FROM journals WHERE issn_online=? OR issn_print=? LIMIT 1", [
      issn,
      issn,
    ]);
    if (jr) return jr.id;
  }
  return null;
}

async function resolveVolumeIssueIds(conn, journal_id, { url, form }, parsed) {
  const warn = [];
  let volume_id = safeInt(form.get("volume_id")) ?? safeInt(new URL(url).searchParams.get("volume_id"));
  let issue_id = safeInt(form.get("issue_id")) ?? safeInt(new URL(url).searchParams.get("issue_id"));

  // validate explicit ids
  if (volume_id != null) {
    const [[v]] = await conn.query("SELECT id FROM volumes WHERE id=? AND journal_id=? LIMIT 1", [
      volume_id,
      journal_id,
    ]);
    if (!v) {
      warn.push(`volume_id ${volume_id} does not belong to journal ${journal_id}`);
      volume_id = null;
    }
  }
  if (issue_id != null) {
    const [[i]] = await conn.query("SELECT id FROM issues WHERE id=? AND journal_id=? LIMIT 1", [
      issue_id,
      journal_id,
    ]);
    if (!i) {
      warn.push(`issue_id ${issue_id} does not belong to journal ${journal_id}`);
      issue_id = null;
    }
  }
  if (volume_id && issue_id) {
    const [[vn]] = await conn.query("SELECT volume_number FROM volumes WHERE id=?", [volume_id]);
    const [[inm]] = await conn.query("SELECT issue_number FROM issues WHERE id=?", [issue_id]);
    return { volume_id, issue_id, vnum: vn?.volume_number ?? null, inum: inm?.issue_number ?? null, warnings: warn };
  }

  const vnumInput = safeInt(form.get("volume_number")) ?? safeInt(new URL(url).searchParams.get("volume_number"));
  const inumInput = safeInt(form.get("issue_number")) ?? safeInt(new URL(url).searchParams.get("issue_number"));

  const vnum = vnumInput ?? parsed.volume_number ?? null;
  const inum = inumInput ?? parsed.issue_number ?? null;

  if (vnum != null && !volume_id) {
    const [[vol]] = await conn.query("SELECT id FROM volumes WHERE journal_id=? AND volume_number=? LIMIT 1", [
      journal_id,
      vnum,
    ]);
    if (vol) volume_id = vol.id;
    else warn.push(`Volume ${vnum} not found for journal ${journal_id}.`);
  }
  if (inum != null && !issue_id) {
    const [[iss]] = await conn.query("SELECT id FROM issues WHERE journal_id=? AND issue_number=? LIMIT 1", [
      journal_id,
      inum,
    ]);
    if (iss) issue_id = iss.id;
    else warn.push(`Issue ${inum} not found for journal ${journal_id}.`);
  }

  return { volume_id: volume_id ?? null, issue_id: issue_id ?? null, vnum, inum, warnings: warn };
}

/* ───────── route ───────── */
// export async function POST(req) {
//   try {
//     const form = await req.formData();
//     const file = form.get("file");
//     if (!file || typeof file === "string") {
//       return NextResponse.json({ success: false, message: "file is required" }, { status: 400 });
//     }

//     const conn = await createDbConnection();
//     try {
//       const journal_id = await resolveJournalId(conn, { url: req.url, form });
//       if (journal_id === null) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "A valid journal identifier is required. Send one of: form 'journal_id' or 'jid', query '?jid=', 'short_name', 'journal_name', or 'issn'.",
//           },
//           { status: 400 }
//         );
//       }

//       // save file
//       const originalName = file.name || "upload.docx";
//       const base = slugifyBaseName(originalName.replace(/\.[^.]+$/, "")) || "doc";
//       const ext = path.extname(originalName) || ".docx";
//       const unique = crypto.randomBytes(6).toString("hex");
//       const safeName = `${base}-${unique}${ext}`;
//       const uploadDir = path.join(process.cwd(), "public", "uploads", "staged");
//       await fs.mkdir(uploadDir, { recursive: true });

//       const arrayBuffer = await file.arrayBuffer();
//       const buf = Buffer.from(arrayBuffer);
//       await fs.writeFile(path.join(uploadDir, safeName), buf);
//       const storage_path = `/uploads/staged/${safeName}`;
//       const mime_type = file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
//       const size_bytes = buf.byteLength;

//       // extract text
//       const { value } = await mammoth.extractRawText({ buffer: buf });
//       const normalized = normalizeUnicode(value || "");
//       const lines = splitLines(normalized);
//       const fullText = lines.join("\n");
//       const headerFooter = await readHeaderFooterTextFromDocx(buf);

//      // Extract anchors from DOCX HTML for references
// let anchorsPerItem = null;
// try {
//   anchorsPerItem = await extractRefAnchorsPerItem(buf);
// } catch (e) {
//   console.warn("Anchor extraction failed:", e);
//   anchorsPerItem = null;
// }

//       // title
//       const idxOrig = lines.findIndex((l) => /^Original Article$/i.test(l));
//       let title = "";
//       if (idxOrig >= 0) {
//         for (let i = idxOrig + 1; i < Math.min(idxOrig + 6, lines.length); i++) {
//           const cand = lines[i];
//           if (!cand || /^Original Article$/i.test(cand) || /^ISSN\b/i.test(cand)) continue;
//           if (cand.length >= 8) { title = cand; break; }
//         }
//       }
//       if (!title) {
//         title = lines.find((l) => l && !/^Original Article$/i.test(l) && !/^ISSN\b/i.test(l) && l.length > 12 && /^[A-Z]/.test(l)) || "";
//       }

//       // authors
//       let authorsLine = "";
//       for (let k = idxOrig >= 0 ? idxOrig + 1 : 0; k < Math.min(lines.length, idxOrig >= 0 ? idxOrig + 6 : 6); k++) {
//         if (/,/.test(lines[k]) && !/Received:/.test(lines[k])) { authorsLine = lines[k]; break; }
//       }
//       const authors = authorsLine ? authorsLine.split(/,| and /i).map(cleanAuthor).filter(Boolean) : [];

//       // dates / abstract / keywords
//       const datesLine = lines.find((l) => /Received:\s*\d{1,2}\s+\w+\s+\d{4}/i.test(l)) || "";
//       const { received_date, revised_date, accepted_date, published_date } = parseDates(datesLine);
//       const iAbs = lines.findIndex((l) => /^Abstract\b/i.test(l));
//       const iKeys = lines.findIndex((l) => /^Keywords\b/i.test(l));
//       const abstract = iAbs >= 0 && iKeys > iAbs ? lines.slice(iAbs, iKeys).join(" ").replace(/^Abstract\s*[-:]\s*/i, "") : "";
//       const keywords = iKeys >= 0 ? lines[iKeys].replace(/^Keywords\s*[-:]\s*/i, "") : "";

//       // header text
//       const headerTop = getHeaderText(lines);
//       const headerAll = headerFooter ? `${headerFooter}\n${headerTop}` : headerTop;

//       // vol/issue numbers (parsed)
//       let vnum = null, inum = null;
//       const viIdx = findFirstVolIssueIndex(lines, VOL_ISSUE_SCAN_LIMIT);
//       if (viIdx >= 0) {
//         const around = lines.slice(Math.max(0, viIdx - 1), Math.min(lines.length, viIdx + 2)).join(" ");
//         const vi = parseVolIssueAnywhere(around);
//         vnum = vi.volume_number ?? null;
//         inum = vi.issue_number ?? null;
//       }
//       if (vnum == null || inum == null) {
//         const viHead = parseVolIssueAnywhere(headerAll);
//         vnum = vnum ?? viHead.volume_number ?? null;
//         inum = inum ?? viHead.issue_number ?? null;
//       }
//       if (vnum == null || inum == null) {
//         const viBody = parseVolIssueAnywhere(fullText);
//         vnum = vnum ?? viBody.volume_number ?? null;
//         inum = inum ?? viBody.issue_number ?? null;
//       }

//       // pages
//       let pageHits = findPageRangesAround(lines, viIdx, 2, 6);
//       let pages_from = pageHits.length ? pageHits.sort((a, b) => a.line - b.line || a.index - b.index)[0].from : null;
//       let pages_to = pageHits.length ? pageHits.sort((a, b) => a.line - b.line || a.index - b.index)[0].to : null;
//       if (pages_from == null || pages_to == null) {
//         const pHead = chooseHeaderPages(headerAll);
//         if (pHead.pages_from != null) { pages_from = pHead.pages_from; pages_to = pHead.pages_to; }
//       }
//       if (pages_from == null || pages_to == null) {
//         const pBody = parsePagesBeforeReferences(lines);
//         if (pBody.pages_from != null) { pages_from = pBody.pages_from; pages_to = pBody.pages_to; }
//       }

//       // months/year
//       let month_from = null, month_to = null, year = null;
//       {
//         const m = /([A-Za-z]{3,9})\s*-\s*([A-Za-z]{3,9})\s+((?:19|20)\d{2})/i.exec(headerAll);
//         if (m) {
//           const M = (s) => MONTHS[s.toLowerCase()];
//           const m1 = M(m[1]), m2 = M(m[2]);
//           if (m1 && m2) { month_from = m1; month_to = m2; }
//           year = num(m[3]);
//         }
//         if (year == null)
//           year = parseInt((/(?:19|20)\d{2}/.exec(headerAll)?.[0] || ""), 10) || (published_date ? new Date(published_date).getFullYear() : null);
//       }

//       // filename hints
//       const fromName = parseArticleIdFromFilename(originalName);
//       const suggested_article_id = fromName?.article_id || null;
//       if (vnum == null) vnum = fromName?.volume_number ?? null;
//       if (inum == null) inum = fromName?.issue_number ?? null;

//       // ids
//       const idsH = parseIssnAndDoiFromHeader(headerAll);
//       const issn = idsH.issn || null;
//       const doi_url = idsH.doi_url || parseDoiUrlAnywhere(headerAll) || parseDoiUrlAnywhere(fullText) || null;

//       /* ── REFERENCES: extract → split → clean → build CK HTML (WITH NUMBERING & allow-list links) ── */
//       const iRefs = lines.findIndex(l => /^(References?|Bibliography)\s*:?\s*$/i.test(l));
//       let referencesHtml = null;

//       if (iRefs >= 0) {
//         const refsLines = lines.slice(iRefs + 1);
//         const refsArrayRaw = splitReferencesSmart(refsLines);
//         const refsArray = sanitizeRefs(refsArrayRaw);

//         let allowedRows = [];
//         try {
//           const [rows] = await conn.query(
//             "SELECT `key`,`label`,`match_pattern`,`priority` FROM `ref_links_allow` WHERE `enabled`=1 ORDER BY `priority` ASC"
//           );
//           // No search templates — we only render present links
//           allowedRows = (rows || []).filter(r => !/\{q\}/i.test(r.match_pattern || ""));
//         } catch (e) {
//           if (e?.code !== "ER_NO_SUCH_TABLE") throw e;
//         }

//         // Minimal defaults if DB empty/missing
//         const hasDoi = allowedRows.some(r =>
//           /^(doi|crossref)$/i.test(r.key) || /doi\.org/i.test(r.match_pattern || "")
//         );
//         const hasUrl = allowedRows.some(r => /^url$/i.test(r.key));
//         if (!hasDoi) allowedRows.push({ key: "crossref", label: "CrossRef", match_pattern: "doi.org", priority: 10 });
//         if (!hasUrl) allowedRows.push({ key: "url", label: "Publisher Link", match_pattern: "url", priority: 20 });

// if (refsArray.length) {
//   referencesHtml = refsArrayToCkHtml(refsArray, null, anchorsPerItem);
// }
//       }

//       // resolve volume_id / issue_id using inputs → numbers → parsed
//       const { volume_id, issue_id, vnum: vnOut, inum: inOut, warnings: warn } = await resolveVolumeIssueIds(
//         conn,
//         journal_id,
//         { url: req.url, form },
//         { volume_number: vnum, issue_number: inum }
//       );

//       vnum = vnOut;
//       inum = inOut;

//       // dynamic insert
//       const [colsRows] = await conn.query(
//         `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
//          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staged_articles'`
//       );
//       const existing = new Set(colsRows.map((r) => r.COLUMN_NAME));

//       const payload = {
//         journal_id,
//         title: title || null,
//         year: year ?? null,
//         month_from: month_from ?? null,
//         month_to: month_to ?? null,
//         pages_from: pages_from ?? null,
//         pages_to: pages_to ?? null,
//         abstract: abstract || null,
//         keywords: keywords || null,
//         received_date: received_date || null,
//         revised_date: revised_date || null,
//         accepted_date: accepted_date || null,
//         published_date: published_date || null,

//         // file
//         file_name: safeName,
//         original_name: originalName,
//         mime_type,
//         size_bytes,
//         storage_path,

//         status: "extracted",
//         article_id: suggested_article_id,

//         // store numbers and resolved IDs
//         volume_number: vnum ?? null,
//         issue_number: inum ?? null,
//         volume_id: volume_id ?? null,
//         issue_id: issue_id ?? null,

//         // identifiers
//         doi_url: doi_url || null,
//         issn: issn || null,

//         // references HTML (complete block with heading + numbered list)
//         references: referencesHtml, // <- render this at the very end of your article body
//       };

//       const cols = Object.keys(payload).filter((k) => existing.has(k));
//       const vals = cols.map((k) => (payload[k] === undefined ? null : payload[k]));
//       const q = (name) => `\`${String(name).replace(/`/g, "``")}\``;
//       const colsEsc = cols.map(q).join(", ");
//       const placeholders = cols.map(() => "?").join(", ");

//       const sql = `INSERT INTO staged_articles (${colsEsc}) VALUES (${placeholders})`;
//       const [ins] = await conn.query(sql, vals);

//       const stagedId = ins.insertId;

//       // authors
//       try {
//         if (authors.length) {
//           await conn.query(
//             "INSERT INTO staged_article_authors (staged_article_id, author_order, full_name) VALUES ?",
//             [authors.map((a, i) => [stagedId, i + 1, a])]
//           );
//         }
//       } catch (e) {
//         if (e?.code !== "ER_NO_SUCH_TABLE") throw e;
//       }

//       return NextResponse.json({
//         success: true,
//         staged_article_id: stagedId,
//         stored_path: storage_path,
//         file_name: safeName,
//         extracted_preview: {
//           article_id: suggested_article_id,
//           title,
//           authors,
//           year,
//           month_from,
//           month_to,
//           pages_from,
//           pages_to,
//           received_date,
//           revised_date,
//           accepted_date,
//           published_date,
//           keywords,
//           doi_url: doi_url || null,
//           issn,
//           volume_number: vnum ?? null,
//           issue_number: inum ?? null,
//           volume_id: volume_id ?? null,
//           issue_id: issue_id ?? null,
//           warnings: warn,
//         },
//       });
//     } finally {
//       await conn.end();
//     }
//   } catch (e) {
//     console.error("Stage error:", e);
//     return NextResponse.json(
//       { success: false, message: "Staging failed", error: String(e?.message || e) },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, message: "file is required" }, { status: 400 });
    }

    const conn = await createDbConnection();
    try {
      const journal_id = await resolveJournalId(conn, { url: req.url, form });
      if (journal_id === null) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A valid journal identifier is required. Send one of: form 'journal_id' or 'jid', query '?jid=', 'short_name', 'journal_name', or 'issn'.",
          },
          { status: 400 }
        );
      }

      // save file
      const originalName = file.name || "upload.docx";
      const base = slugifyBaseName(originalName.replace(/\.[^.]+$/, "")) || "doc";
      const ext = path.extname(originalName) || ".docx";
      const unique = crypto.randomBytes(6).toString("hex");
      const safeName = `${base}-${unique}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "staged");
      await fs.mkdir(uploadDir, { recursive: true });

      const arrayBuffer = await file.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      await fs.writeFile(path.join(uploadDir, safeName), buf);
      const storage_path = `/uploads/staged/${safeName}`;
      const mime_type =
        file.type ||
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const size_bytes = buf.byteLength;

      // extract text
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const normalized = normalizeUnicode(value || "");
      const lines = splitLines(normalized);
      const fullText = lines.join("\n");
      const headerFooter = await readHeaderFooterTextFromDocx(buf);

      // Extract anchors from DOCX HTML for references
      let anchorsPerItem = null;
      try {
        anchorsPerItem = await extractRefAnchorsPerItem(buf);
      } catch (e) {
        console.warn("Anchor extraction failed:", e);
        anchorsPerItem = null;
      }

      // title
      const idxOrig = lines.findIndex((l) => /^Original Article$/i.test(l));
      let title = "";
      if (idxOrig >= 0) {
        for (let i = idxOrig + 1; i < Math.min(idxOrig + 6, lines.length); i++) {
          const cand = lines[i];
          if (!cand || /^Original Article$/i.test(cand) || /^ISSN\b/i.test(cand)) continue;
          if (cand.length >= 8) {
            title = cand;
            break;
          }
        }
      }
      if (!title) {
        title =
          lines.find(
            (l) =>
              l &&
              !/^Original Article$/i.test(l) &&
              !/^ISSN\b/i.test(l) &&
              l.length > 12 &&
              /^[A-Z]/.test(l)
          ) || "";
      }

      // authors
    // ── AUTHORS extraction (handles "M. Shoikhedbrod*, I. Shoikhedbrod1")
let authors = [];

// 1️⃣ Try to find an explicit "Authors:" block in the doc
const authorsMatch = fullText.match(
  /(?:^|\n)\s*Authors?\s*[:\-]\s*([\s\S]+?)(?=\n\s*(Abstract|Keywords?|Received|Accepted|Published)\b)/i
);
if (authorsMatch && authorsMatch[1]) {
  authors = authorsMatch[1]
    .split(/,| and |\n/)
    .map((name) =>
      cleanAuthor(
        name
          .replace(/[*\d]+/g, "") // remove footnote markers like *,1
      )
    )
    .filter(Boolean);
}

// 2️⃣ Fallback: lines right after "Original Article" header (your PDF style)
if (!authors.length) {
  const startIdx = idxOrig >= 0 ? idxOrig + 1 : 0;
  for (
    let i = startIdx;
    i < Math.min(lines.length, startIdx + 8);
    i++
  ) {
    const line = lines[i] || "";

    // stop if we've hit affiliation, abstract header, or dates
    if (
      /^(r&d|department|faculty|university|institute|abstract|keywords?|received|accepted|published|introduction)/i.test(
        line
      )
    ) {
      break;
    }

    // look for "M. Shoikhedbrod*, I. Shoikhedbrod1" style
    if (/[A-Z]\.\s*[A-Z][a-z]+/.test(line)) {
      authors = line
        .replace(/[*\d]+/g, "") // strip *, 1, 2 footnote refs
        .split(/,| and /i)
        .map((s) => cleanAuthor(s))
        .filter(Boolean);
      break;
    }
  }
}

// 3️⃣ Fallback: text before "Received:"
if (!authors.length) {
  const beforeReceived = fullText.split(/Received:/i)[0] || "";
  const m = beforeReceived.match(
    /([A-Z]\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*,\s*[A-Z]\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)+)/
  );
  if (m && m[1]) {
    authors = m[1]
      .replace(/[*\d]+/g, "")
      .split(/,| and /i)
      .map((s) => cleanAuthor(s))
      .filter(Boolean);
  }
}

// 4️⃣ Last resort
if (!authors.length) {
  authors = [];
}

      // dates / abstract / keywords
      const datesLine =
        lines.find((l) => /Received:\s*\d{1,2}\s+\w+\s+\d{4}/i.test(l)) || "";
      const { received_date, revised_date, accepted_date, published_date } =
        parseDates(datesLine);
      const iAbs = lines.findIndex((l) => /^Abstract\b/i.test(l));
      const iKeys = lines.findIndex((l) => /^Keywords\b/i.test(l));
      const abstract =
        iAbs >= 0 && iKeys > iAbs
          ? lines
              .slice(iAbs, iKeys)
              .join(" ")
              .replace(/^Abstract\s*[-:]\s*/i, "")
          : "";
      const keywords =
        iKeys >= 0
          ? lines[iKeys].replace(/^Keywords\s*[-:]\s*/i, "")
          : "";

      // header text
      const headerTop = getHeaderText(lines);
      const headerAll = headerFooter ? `${headerFooter}\n${headerTop}` : headerTop;

      // vol/issue numbers
      let vnum = null,
        inum = null;
      const viIdx = findFirstVolIssueIndex(lines, 40);
      if (viIdx >= 0) {
        const around = lines
          .slice(Math.max(0, viIdx - 1), Math.min(lines.length, viIdx + 2))
          .join(" ");
        const vi = parseVolIssueAnywhere(around);
        vnum = vi.volume_number ?? null;
        inum = vi.issue_number ?? null;
      }
      if (vnum == null || inum == null) {
        const viHead = parseVolIssueAnywhere(headerAll);
        vnum = vnum ?? viHead.volume_number ?? null;
        inum = inum ?? viHead.issue_number ?? null;
      }
      if (vnum == null || inum == null) {
        const viBody = parseVolIssueAnywhere(fullText);
        vnum = vnum ?? viBody.volume_number ?? null;
        inum = inum ?? viBody.issue_number ?? null;
      }

      // pages
      let pageHits = findPageRangesAround(lines, viIdx, 2, 6);
      let pages_from = pageHits.length
        ? pageHits.sort((a, b) => a.line - b.line || a.index - b.index)[0].from
        : null;
      let pages_to = pageHits.length
        ? pageHits.sort((a, b) => a.line - b.line || a.index - b.index)[0].to
        : null;
      if (pages_from == null || pages_to == null) {
        const pHead = chooseHeaderPages(headerAll);
        if (pHead.pages_from != null) {
          pages_from = pHead.pages_from;
          pages_to = pHead.pages_to;
        }
      }
      if (pages_from == null || pages_to == null) {
        const pBody = parsePagesBeforeReferences(lines);
        if (pBody.pages_from != null) {
          pages_from = pBody.pages_from;
          pages_to = pBody.pages_to;
        }
      }

      // months/year
      let month_from = null,
        month_to = null,
        year = null;
      {
        const m = /([A-Za-z]{3,9})\s*-\s*([A-Za-z]{3,9})\s+((?:19|20)\d{2})/i.exec(
          headerAll
        );
        if (m) {
          const M = (s) => MONTHS[s.toLowerCase()];
          const m1 = M(m[1]),
            m2 = M(m[2]);
          if (m1 && m2) {
            month_from = m1;
            month_to = m2;
          }
          year = num(m[3]);
        }
        if (year == null)
          year =
            parseInt(
              (/(?:19|20)\d{2}/.exec(headerAll)?.[0] || ""),
              10
            ) ||
            (published_date ? new Date(published_date).getFullYear() : null);
      }

      // filename hints
      const fromName = parseArticleIdFromFilename(originalName);
      const suggested_article_id = fromName?.article_id || null;
      if (vnum == null) vnum = fromName?.volume_number ?? null;
      if (inum == null) inum = fromName?.issue_number ?? null;

      // ids
      const idsH = parseIssnAndDoiFromHeader(headerAll);
      const issn = idsH.issn || null;
      const doi_url =
        idsH.doi_url ||
        parseDoiUrlAnywhere(headerAll) ||
        parseDoiUrlAnywhere(fullText) ||
        null;

      // references
      const iRefs = lines.findIndex((l) =>
        /^(References?|Bibliography)\s*:?\s*$/i.test(l)
      );
      let referencesHtml = null;

      if (iRefs >= 0) {
        const refsLines = lines.slice(iRefs + 1);
        const refsArrayRaw = splitReferencesSmart(refsLines);
        const refsArray = sanitizeRefs(refsArrayRaw);

        let allowedRows = [];
        try {
          const [rows] = await conn.query(
            "SELECT `key`,`label`,`match_pattern`,`priority` FROM `ref_links_allow` WHERE `enabled`=1 ORDER BY `priority` ASC"
          );
          allowedRows = (rows || []).filter(
            (r) => !/\{q\}/i.test(r.match_pattern || "")
          );
        } catch (e) {
          if (e?.code !== "ER_NO_SUCH_TABLE") throw e;
        }

        if (!allowedRows.some((r) => /doi\.org/i.test(r.match_pattern || ""))) {
          allowedRows.push({
            key: "crossref",
            label: "CrossRef",
            match_pattern: "doi.org",
            priority: 10,
          });
        }
        if (!allowedRows.some((r) => /^url$/i.test(r.key))) {
          allowedRows.push({
            key: "url",
            label: "Publisher Link",
            match_pattern: "url",
            priority: 20,
          });
        }

        if (refsArray.length) {
          referencesHtml = refsArrayToCkHtml(refsArray, null, anchorsPerItem);
        }
      }

      // resolve volume_id / issue_id
      const {
        volume_id,
        issue_id,
        vnum: vnOut,
        inum: inOut,
        warnings: warn,
      } = await resolveVolumeIssueIds(
        conn,
        journal_id,
        { url: req.url, form },
        { volume_number: vnum, issue_number: inum }
      );

      vnum = vnOut;
      inum = inOut;

      /* ───────────────────────────────
         CROSS-JOURNAL & DUPLICATE CHECKS
      ─────────────────────────────── */
// FromName is already declared earlier
// Step 0: fetch journal info
const [[journalRow]] = await conn.query(
  "SELECT journal_name, short_name FROM journals WHERE id=?",
  [journal_id]
);

if (!journalRow) {
  return NextResponse.json(
    { success: false, message: `Journal not found for ID=${journal_id}` },
    { status: 400 }
  );
}

// Step 1: Extract article prefix (before first hyphen, or full if no hyphen)
let prefix = "";
if (suggested_article_id && suggested_article_id.includes("-")) {
  prefix = suggested_article_id.split("-")[0].toUpperCase();
} else if (suggested_article_id) {
  prefix = suggested_article_id.toUpperCase();
}

// Step 2: Normalize journal code
let baseAllowed = (journalRow.short_name || journalRow.journal_name).toUpperCase();
if (baseAllowed.startsWith("DS-")) {
  baseAllowed = baseAllowed.replace(/^DS-/, ""); // strip DS-
}

// Step 3: Compare
if (prefix && baseAllowed && prefix !== baseAllowed) {
  return NextResponse.json(
    {
      success: false,
      message: `Upload blocked: This article (${prefix}) belongs to another journal. Only ${journalRow.short_name} articles are allowed for Journal ID ${journal_id}.`
    },
    { status: 400 }
  );
}



      // duplicate file check
// ✅ Duplicate file check (only the tables you actually have)
const [fileDup] = await conn.query(
  `
   SELECT id, journal_id, 'staged' as source 
   FROM staged_articles 
   WHERE file_name=?
  `,
  [originalName]
);

if (fileDup.length > 0) {
  return NextResponse.json(
    {
      success: false,
      message: `Upload blocked: File already exists in ${fileDup[0].source} (Journal ID ${fileDup[0].journal_id})`,
    },
    { status: 400 }
  );
}

      /* ───────────────────────────────
         INSERT INTO staged_articles
      ─────────────────────────────── */
      const [colsRows] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staged_articles'`
      );
      const existing = new Set(colsRows.map((r) => r.COLUMN_NAME));

const payload = {
  journal_id,
  title: title || null,
  year: year ?? null,
  month_from: month_from ?? null,
  month_to: month_to ?? null,
  pages_from: pages_from ?? null,
  pages_to: pages_to ?? null,
  abstract: abstract || null,
  keywords: keywords || null,

  // 👇 add authors directly into staged_articles
  authors: authors.length ? JSON.stringify(authors) : null,

  received_date: received_date || null,
  revised_date: revised_date || null,
  accepted_date: accepted_date || null,
  published_date: published_date || null,
  file_name: safeName,
  original_name: originalName,
  mime_type,
  size_bytes,
  storage_path,
  status: "extracted",
  article_id: suggested_article_id,
  volume_number: vnum ?? null,
  issue_number: inum ?? null,
  volume_id: volume_id ?? null,
  issue_id: issue_id ?? null,
  doi_url: doi_url || null,
  issn: issn || null,
  references: referencesHtml,
};


      const cols = Object.keys(payload).filter((k) => existing.has(k));
      const vals = cols.map((k) =>
        payload[k] === undefined ? null : payload[k]
      );
      const q = (name) => `\`${String(name).replace(/`/g, "``")}\``;
      const colsEsc = cols.map(q).join(", ");
      const placeholders = cols.map(() => "?").join(", ");

      const sql = `INSERT INTO staged_articles (${colsEsc}) VALUES (${placeholders})`;
      const [ins] = await conn.query(sql, vals);
      const stagedId = ins.insertId;

      return NextResponse.json({
        success: true,
        staged_article_id: stagedId,
        stored_path: storage_path,
        file_name: safeName,
        extracted_preview: {
          article_id: suggested_article_id,
          title,
          authors,
          year,
          month_from,
          month_to,
          pages_from,
          pages_to,
          received_date,
          revised_date,
          accepted_date,
          published_date,
          keywords,
          doi_url: doi_url || null,
          issn,
          volume_number: vnum ?? null,
          issue_number: inum ?? null,
          volume_id: volume_id ?? null,
          issue_id: issue_id ?? null,
          warnings: warn,
        },
      });
    } finally {
      await conn.end();
    }
  } catch (e) {
    console.error("Stage error:", e);
    return NextResponse.json(
      { success: false, message: "Staging failed", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

/* ----------------------- LIST all staged articles ----------------------- */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const jid = Number(searchParams.get("jid") ?? 0);
  const status = (searchParams.get("status") ?? "extracted").toLowerCase();
  const q = (searchParams.get("q") || "").trim();

  if (!jid)
    return NextResponse.json({ success: false, message: "jid required" }, { status: 400 });

  const conn = await createDbConnection();

  try {
    const where = ["journal_id = ?", "status = ?"];
    const params = [jid, status];
    if (q) {
      where.push("(title LIKE ? OR article_id LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await conn.query(
      `
      SELECT id, journal_id, file_name, storage_path, title, article_id, abstract,
             authors, keywords, \`references\` AS refs,
             volume_number, issue_number, year, pages_from, pages_to, status,
             received_date, revised_date, accepted_date, published_date,
             created_at, updated_at
      FROM staged_articles
      WHERE ${where.join(" AND ")}
      ORDER BY id DESC
      `,
      params
    );

    const records = rows.map((r) => ({
      ...r,
      authors: (() => {
        try {
          return Array.isArray(r.authors)
            ? r.authors
            : JSON.parse(r.authors || "[]");
        } catch {
          return [];
        }
      })(),
      keywords: Array.isArray(r.keywords)
        ? r.keywords.join(", ")
        : r.keywords ?? "",
      references: r.refs ?? "",
    }));

    return NextResponse.json({
      success: true,
      total: records.length,
      records,
    });
  } catch (e) {
    console.error("❌ GET /api/articles/stage failed:", e);
    return NextResponse.json(
      { success: false, message: e.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    try { await conn.end(); } catch {}
  }
}