// src/lib/refsQuill.js

function stripTags(s = "") { return String(s || "").replace(/<[^>]*>/g, ""); }
function escReg(s = "")   { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }



/** Build a nice linked Delta from ["ref #1", ...] using your allowlist rules */
export function refsArrayToQuill(refs = [], allowed = [], labelMap = {}) {
  const ops = [];

  const patterns = (allowed || [])
    .map(a => ({
      key: a.key,
      label: labelMap[a.key] || a.key,
      pat: (a.match_pattern || "").toLowerCase(),
      pr: a.priority ?? 100,
    }))
    .sort((a, b) => a.pr - b.pr);

  const linkOps = (label, href) => ([
    { insert: `[${label}]`, attributes: { link: href } },
    { insert: " " },
  ]);

  const pickLinks = (raw) => {
    const links = [];
    const src = String(raw || "");
    const txt = src.toLowerCase();

    const url = (src.match(/\bhttps?:\/\/\S+/i) || [])[0] || null;

    for (const p of patterns) {
      if (!p.pat) continue;
      if (!txt.includes(p.pat)) continue;

      let href = url;

      if (!href) {
        if (p.key === "doi") {
          const m = src.match(/\b10\.\S+\b/);
          if (m) href = "https://doi.org/" + m[0].replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "");
        } else if (p.key === "googlescholar") {
          href = "https://scholar.google.com/scholar?q=" + encodeURIComponent(src.replace(/^\[\d+\]\s*/, "").slice(0, 200));
        } else if (p.key === "crossref") {
          href = "https://search.crossref.org/?q=" + encodeURIComponent(src.replace(/^\[\d+\]\s*/, "").slice(0, 200));
        } else if (p.key === "pubmed") {
          const pmid = (src.match(/\bPMID[:\s]*([0-9]+)\b/i) || [])[1];
          href = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
                      : "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(src.slice(0, 200));
        } else if (p.key === "pmc") {
          const pmcid = (src.match(/\bPMCID[:\s]*([A-Z0-9]+)\b/i) || [])[1];
          href = pmcid ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
                       : "https://www.ncbi.nlm.nih.gov/pmc/?term=" + encodeURIComponent(src.slice(0, 200));
        } else if (p.key === "arxiv") {
          const aid = (src.match(/\b(?:arXiv:)?(\d{4}\.\d{4,5})\b/i) || [])[1];
          href = aid ? `https://arxiv.org/abs/${aid}`
                     : "https://arxiv.org/search/?query=" + encodeURIComponent(src.slice(0, 200)) + "&searchtype=all";
        }
      }

      if (!href && url) href = url;
      if (href) links.push({ label: p.label, href });
    }

    if (!links.length && url) links.push({ label: labelMap.url || "URL", href: url });
    return links;
  };

  (refs || []).forEach((ref, i) => {
    const body = String(ref || "").replace(/^\[\d+\]\s*/, "");
    ops.push({ insert: `${i + 1}. ${body}\n` });
    for (const l of pickLinks(ref)) ops.push(...linkOps(l.label, l.href));
    ops.push({ insert: "\n" });
  });

  return JSON.stringify({ ops });
}

/** Convert an HTML <ol><li>…</li></ol> with anchor chips into a Quill Delta */
export function olHtmlToQuill(html = "") {
  const ops = [];
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let m, i = 0;

  while ((m = liRe.exec(html))) {
    let liHtml = m[1];

    // Collect links
    const links = [];
    const aRe = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let a;
    while ((a = aRe.exec(liHtml))) {
      const href = a[1];
      const label = stripTags(a[2]).trim();
      if (label && href) links.push({ label, href });
    }

    // Plain text (citation) without [Label] echoes
    let text = stripTags(liHtml).replace(/\s+/g, " ").trim();
    for (const l of links) {
      const re = new RegExp(`\\[\\s*${escReg(l.label)}\\s*\\]`, "gi");
      text = text.replace(re, "").trim();
    }

    ops.push({ insert: `${++i}. ${text}\n` });
    for (const l of links) {
      ops.push({ insert: `[${l.label}]`, attributes: { link: l.href } });
      ops.push({ insert: " " });
    }
    ops.push({ insert: "\n" });
  }

  return JSON.stringify({ ops });
}
