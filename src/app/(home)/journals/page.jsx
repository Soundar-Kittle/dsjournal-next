import Link from "next/link";
import { headers } from "next/headers";
import JournalCard from "@/components/Home/Journals/JournalCard";
import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const generateMetadata = async () => {
  return await generateDynamicMeta("journals");
};

// normalize cover paths like "uploads/..." → "/uploads/..."
function toCoverUrl(v) {
  if (!v) return null;
  let u = String(v).trim();
  if (u === "null") return null;
  if (
    !u.startsWith("http://") &&
    !u.startsWith("https://") &&
    !u.startsWith("/")
  )
    u = "/" + u;
  if (u.startsWith("http://")) u = u.replace(/^http:\/\//, "https://");
  return u;
}

// make a safe slug from short_name (e.g., "DS-LLL" -> "lll")
function slugFromShortName(s) {
  if (!s) return null;
  return s
    .replace(/^DS-?/i, "") // drop DS- prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alnum → hyphen
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

async function fetchJournals() {
  try {
    const hdrs = await headers();
    const host = hdrs.get("host");
    const proto = process.env.NODE_ENV === "development" ? "http" : "https";
    const url = `${proto}://${host}/api/journals`;

    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const list = Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.journals)
      ? data.journals
      : [];

    return list.map((r) => ({
      id: Number(r.id),
      name: String(r.name ?? r.journal_name ?? r.title ?? ""),
      // prefer an explicit slug if present; else derive from short_name; else fallback to id
      slug: r.slug
        ? String(r.slug).toLowerCase()
        : slugFromShortName(r.short_name) ?? String(r.id),
      cover_url: toCoverUrl(r.cover_url ?? r.cover ?? r.cover_image ?? null),
      issn_print: r.issn_print && r.issn_print !== "null" ? r.issn_print : "",
      issn_online:
        r.issn_online && r.issn_online !== "null" ? r.issn_online : "",
    }));
  } catch (e) {
    console.error("journals page fetch failed", e);
    return [];
  }
}

export default async function JournalsPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? "")
    .trim()
    .toLowerCase();

  const journals = await fetchJournals();

  const visible = q
    ? journals.filter(
        (j) =>
          (j.name || "").toLowerCase().includes(q) ||
          (j.issn_online || "").toLowerCase().includes(q) ||
          (j.issn_print || "").toLowerCase().includes(q)
      )
    : journals;

  return (
    <div className="">
      <PageHeader title="Journals" />
      <Breadcrumbs />
      {/* <div className="mb-6">
        <nav className="text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-slate-700">
                Home
              </Link>
            </li>
            <li className="select-none">/</li>
            <li className="font-medium text-slate-700">Journals</li>
          </ol>
        </nav>
      </div> */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        {/* Query param search (?q=...) – hydration-safe */}
        <form className="mb-6" action="/journals" method="get">
          <input
            type="text"
            name="q"
            placeholder="Search by journal name or ISSN…"
            defaultValue={q}
            className="w-full md:w-1/2 rounded border border-slate-300 px-3 py-2"
          />
        </form>

        {visible.length === 0 ? (
          <p className="text-slate-600">No journals found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((j) => (
              <JournalCard key={j.id} j={j} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
