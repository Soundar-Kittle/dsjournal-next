import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";

/** fetch a single journal by slug (DS- stripped form like "lll") */
async function fetchJournal(slug) {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  // const url = `${proto}://${host}/api/journals?slug=${encodeURIComponent(slug)}`;
  const url = `${proto}://${host}/api/journals?slug=${encodeURIComponent(slug)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const arr = Array.isArray(data?.journals) ? data.journals : data?.journals ? [data.journals] : [];
  return arr[0] || null;
}

export default async function JournalDetailPage({ params }) {
  const { slug } = params;
  const journal = await fetchJournal(slug);

  if (!journal) {
    return <p className="p-10 text-center text-slate-600">Journal not found.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-slate-700">Home</Link></li>
          <li>/</li>
          <li><Link href="/journals" className="hover:text-slate-700">Journals</Link></li>
          <li>/</li>
          <li className="font-medium text-slate-700">{journal.short_name}</li>
        </ol>
      </nav>

      {/* Journal Title */}
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        {journal.journal_name} ({journal.short_name})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Menu */}
        <aside className="lg:col-span-1 border rounded-md shadow-sm">
          <div className="p-4 font-semibold bg-emerald-600 text-white">
            {journal.short_name} Menu
          </div>
          <ul className="divide-y text-sm">
            <li><Link href="#aim" className="block px-4 py-2 hover:bg-slate-50">Aim and Scope</Link></li>
            <li><Link href="#editorial" className="block px-4 py-2 hover:bg-slate-50">Editorial Board</Link></li>
            <li><Link href="#submission" className="block px-4 py-2 hover:bg-slate-50">Paper Submission</Link></li>
            <li><Link href="#archives" className="block px-4 py-2 hover:bg-slate-50">Current Issue / Archives</Link></li>
            <li><Link href="#topics" className="block px-4 py-2 hover:bg-slate-50">Topics</Link></li>
            <li><Link href="#policies" className="block px-4 py-2 hover:bg-slate-50">Policies</Link></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-8">
          {/* Info Card */}
          <div className="rounded-md border shadow-sm bg-white p-6 flex flex-col md:flex-row gap-6">
            <div className="relative w-48 h-64 border rounded overflow-hidden">
              {journal.cover_image && (
                <Image
                  src={`/${journal.cover_image}`}
                  alt={journal.journal_name}
                  fill
                  className="object-contain"
                />
              )}
            </div>
            <div className="flex-1 text-sm space-y-2">
              <p><b>Editor in Chief:</b> Prof. [Fill from editorial_members table]</p>
              {journal.issn_online && <p><b>ISSN (Online):</b> {journal.issn_online}</p>}
              {journal.issn_print && <p><b>ISSN (Print):</b> {journal.issn_print}</p>}
              <p><b>Subject:</b> {journal.subject}</p>
              <p><b>Year of Starting:</b> {journal.year_started}</p>
              <p><b>Publication Frequency:</b> {journal.publication_frequency}</p>
              <p><b>Language:</b> {journal.language}</p>
              <p><b>Paper Submission:</b> {journal.paper_submission_id}</p>
              <p><b>Publisher:</b> {journal.publisher}</p>
              <p><b>Publication Fee:</b> {journal.publication_fee}</p>
            </div>
          </div>

          {/* Aim & Scope */}
          <section id="aim" className="space-y-3">
            <h2 className="text-xl font-bold">Aim and Scope</h2>
            <p className="text-slate-700">
              {journal.aim_scope || "This journal covers research topics in ..."}
            </p>
          </section>

          {/* Topics */}
          <section id="topics" className="space-y-3">
            <h2 className="text-xl font-bold">Topics</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 text-slate-700 text-sm list-disc pl-6">
              {(journal.topics?.split(",") || []).map((topic, i) => (
                <li key={i}>{topic.trim()}</li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
