// lib/refHtml.js
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const joinAuthors = (arr) =>
  Array.isArray(arr)
    ? arr
        .map((a) =>
          a && typeof a === "object"
            ? (a.family ? `${a.given ?? ""} ${a.family}` : a.literal || "").trim()
            : String(a || "")
        )
        .filter(Boolean)
        .join(", ")
    : "";

function buildRefsHtml(items) {
  const lis = (items || []).map((it) => {
    const authors = joinAuthors(it.author || it.authors);
    const bits = [];
    if (authors) bits.push(esc(authors));
    if (it.title) bits.push(esc(it.title));

    const meta = [];
    const container = it["container-title"] || it.container;
    if (container) meta.push(`<i>${esc(container)}</i>`);
    if (it.volume) meta.push(`vol. ${esc(it.volume)}`);
    if (it.issue) meta.push(`no. ${esc(it.issue)}`);
    if (it.page || it.pages) meta.push(`pp. ${esc(it.page || it.pages)}`);
    if (meta.length) bits.push(meta.join(", "));

    // year (CSL JSON often has issued.date-parts)
    let year = "";
    if (it.issued && it.issued["date-parts"] && it.issued["date-parts"][0]) {
      year = String(it.issued["date-parts"][0][0] || "");
    } else if (it.year) {
      year = String(it.year);
    }
    if (year) bits.push(year);

    const links = [];
    if (it.DOI || it.doi)
      links.push(
        ` [<a href="https://doi.org/${esc(it.DOI || it.doi)}" target="_blank" rel="noopener">CrossRef</a>]`
      );
    if (it.URL || it.url)
      links.push(
        ` [<a href="${esc(it.URL || it.url)}" target="_blank" rel="noopener">Publisher</a>]`
      );

    return `<li>${bits.join(", ")}${links.join("")}</li>`;
  });
  return `<ol class="references">${lis.join("")}</ol>`;
}

module.exports = { buildRefsHtml, esc, joinAuthors };
