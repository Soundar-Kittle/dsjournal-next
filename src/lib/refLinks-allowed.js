// src/lib/refLinks-allowed.js
export async function getAllowedKeys(conn, journalId) {
  try {
    const [rows] = await conn.query(
      `SELECT journal_id, \`key\`, label, match_pattern, priority, id
       FROM ref_links_allow
       WHERE enabled=1 AND (journal_id IS NULL OR journal_id=?)
       ORDER BY (journal_id IS NULL) ASC, priority ASC, id ASC`,
      [journalId]
    );
    return rows;
  } catch (err) {
    // Safe fallback if table missing on a fresh DB
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return [
        { key: "doi",           label: "DOI",            match_pattern: "doi.org",               priority: 10 },
        { key: "crossref",      label: "CrossRef",       match_pattern: "crossref.org",          priority: 20 },
        { key: "pubmed",        label: "PubMed",         match_pattern: "pubmed.ncbi.nlm.nih",   priority: 30 },
        { key: "pmc",           label: "PMC",            match_pattern: "ncbi.nlm.nih.gov/pmc",  priority: 40 },
        { key: "googlescholar", label: "Google Scholar", match_pattern: "scholar.google.",       priority: 50 },
        { key: "arxiv",         label: "arXiv",          match_pattern: "arxiv.org",             priority: 60 },
        { key: "url",           label: "URL",            match_pattern: "http",                  priority: 90 },
      ];
    }
    throw err;
  }
}

export async function getLabelMap(conn, journalId = null) {
  const list = await getAllowedKeys(conn, journalId);
  const map = {};
  for (const r of list) map[r.key] = r.label || r.key;
  if (!map.url) map.url = "URL";
  return map;
}
