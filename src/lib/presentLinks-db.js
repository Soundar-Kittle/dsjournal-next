// src/lib/presentLinks-db.js
const GREEN = "rgb(0, 176, 80)";
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const stripAllHtml = (h) => String(h || "").replace(/<[^>]*>/g, " ");
const linkTag = (label, href) =>
  href ? `[<a href="${href}" target="_blank" rel="noopener" style="color: ${GREEN};">${label}</a>]` : "";

// matches: [CrossRef] | [ Publisher Link ] | [<a href="…">Google Scholar</a>]
const LABEL_RX = /\[\s*(?:<a[^>]*?href=["']([^"']+)["'][^>]*>)?\s*([A-Za-z][A-Za-z\s]+?)\s*(?:<\/a>)?\s*\]/g;

export function extractPresentLinkTokens(rawHtmlOrText, labelMap /* Map */) {
  const s = String(rawHtmlOrText || "");
  const out = [];
  let m;
  while ((m = LABEL_RX.exec(s))) {
    const href  = m[1] || null;
    const label = m[2].trim().replace(/\s+/g, " ");
    const key   = labelMap.get(norm(label));
    if (key) out.push({ label, key, href }); // keep source order
  }
  return out;
}

export function stripBracketLabels(rawHtmlOrText) {
  return stripAllHtml(String(rawHtmlOrText || ""))
    .replace(/\s*\[(?:<\/?a[^>]*>)?\s*(?:[A-Za-z][A-Za-z\s]+)\s*(?:<\/a>)?\]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** build links = (present labels ∩ allowed keys), preserving source order */
export function buildLinksPresentOnly(rawHtmlOrText, allowedKeys = [], labelMap) {
  const allowed = new Set((allowedKeys || []).map(k => k.toLowerCase()));
  const tokens = extractPresentLinkTokens(rawHtmlOrText, labelMap)
    .filter(t => allowed.has(t.key.toLowerCase()));

  // de-dupe by key, keep first occurrence order
  const seen = new Set();
  const ordered = tokens.filter(t => (seen.has(t.key) ? false : (seen.add(t.key), true)));

  return ordered.map(t => linkTag(t.label, t.href)).join(" ");
}

export function refsArrayToQuillPresentOnly(refs = [], allowedKeys = [], labelMap) {
  return (refs || []).map((raw, i) => {
    const main  = stripBracketLabels(raw);
    const links = buildLinksPresentOnly(raw, allowedKeys, labelMap);
    const p1 = `<p class="ql-align-justify">[${i + 1}] ${main}</p>`;
    const p2 = links ? `<p class="ql-align-justify">${links}</p>` : "";
    return p1 + p2;
  }).join("");
}

export function olHtmlToQuillPresentOnly(olHtml, allowedKeys = [], labelMap) {
  const items = [...String(olHtml || "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => m[1]);
  if (!items.length) return "";
  return refsArrayToQuillPresentOnly(items, allowedKeys, labelMap);
}
