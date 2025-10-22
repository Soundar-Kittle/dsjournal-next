import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JournalPage({ params }) {
  const shortName = params["journal-name"]; // e.g., DS-AIR

  // --- resolve proto/host robustly ---
  const hdrs = headers();
  const host =
    hdrs.get("x-forwarded-host") ||
    hdrs.get("host");
  const proto =
    hdrs.get("x-forwarded-proto") ||
    (host && host.startsWith("localhost") ? "http" : "https");

  // --- fetch journal by short name (no cache) ---
  const url = `${proto}://${host}/api/journals?short=${encodeURIComponent(
    shortName
  )}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) notFound();

  const { journals } = await res.json();
  const journal = Array.isArray(journals) ? journals[0] : journals;
  if (!journal) notFound();

  // --- tiles ---
  const tiles = [
    // { slug: "editorial-board", label: "Editorial Board", emoji: "📚" },
    { slug: "archives", label: "Archives", emoji: "🗃️" },
    { slug: "article", label: "Add +", emoji: "👉" },
    { slug: "citation", label: "Citation", emoji: "🤖" },
    { slug: "stage", label: "Stage", emoji: "🏋️" },
    { slug: "pages", label: "Pages", emoji: "📖" },

  ];

  const hrefFor = (slug) =>
    `/admin/dashboard/journals/${encodeURIComponent(shortName)}/${slug}?jid=${encodeURIComponent(
      journal.id
    )}`;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="space-y-1 border-b pb-4">
        <h1 className="text-3xl font-bold">
          {journal.journal_name} ({journal.short_name})
        </h1>

        {(journal.issn_print || journal.issn_online) && (
          <div className="text-sm text-gray-500">
            {journal.issn_print && <>ISSN Print: {journal.issn_print}</>}
            {journal.issn_print && journal.issn_online && " · "}
            {journal.issn_online && <>ISSN Online: {journal.issn_online}</>}
          </div>
        )}
      </header>

      {/* Tiles */}
      <section className="grid gap-6 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.slug}
            href={hrefFor(t.slug)}
            prefetch={false}
            className="rounded border shadow-sm hover:shadow-md transition p-8 flex flex-col items-center justify-center text-center"
          >
            <span className="text-4xl mb-2">{t.emoji}</span>
            <span className="text-lg font-semibold">{t.label}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
