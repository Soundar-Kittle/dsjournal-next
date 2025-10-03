import { getJournalBySlug } from "@/utils/jounals";
import Image from "next/image";

export async function generateMetadata({ params }) {
  const param = await params;
  let slug = param.slug;
  const journal = await getJournalBySlug(slug);
  const baseUrl = process.env.BASE_URL;

  return {
    title: journal.journal_name,
    description: `${journal.short_name} (${journal.issn_online}) is a peer-reviewed journal in ${journal.subject}, published by ${journal.publisher}. Started in ${journal.year_started}, it publishes ${journal.publication_frequency}.`,
    keywords: [
      journal.short_name,
      journal.journal_name,
      journal.subject,
      journal.publisher,
      "ISSN " + journal.issn_online,
      "Research Journal",
    ],
    authors: [{ name: journal.publisher }],
    publisher: journal.publisher,
    openGraph: {
      title: journal.journal_name,
      description: `${journal.short_name} is an international journal in ${journal.subject}.`,
      url: `${baseUrl}/${slug}`,
      siteName: "Dream Science Journals",
      type: "website",
      images: [
        {
          url: `${baseUrl}/${journal.cover_image}`,
          alt: `${journal.journal_name} Cover`,
        },
        {
          url: `${baseUrl}/${journal.banner_image}`,
          alt: `${journal.journal_name} Banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: journal.journal_name,
      description: `${journal.short_name} is a peer-reviewed journal in ${journal.subject}.`,
      images: [`${baseUrl}/${journal.cover_image}`],
    },
    alternates: {
      canonical: `${baseUrl}/${slug}`,
    },
    other: {
      issn_online: journal.issn_online,
      issn_print:
        journal.issn_print !== "null" ? journal.issn_print : undefined,
      doi_prefix: journal.doi_prefix,
      format: journal.format,
      language: journal.language,
      publication_fee: journal.publication_fee,
    },
  };
}

export default async function Page({ params }) {
  const param = await params;
  let slug = param.slug;
  const journal = await getJournalBySlug(slug);
  return (
    <div>
      {/* Info Card */}
      <div className="rounded-md border shadow-sm bg-white p-6 flex flex-col md:flex-row gap-6">
        <div className="relative w-48 h-64 border rounded overflow-hidden">
          {journal.cover_image && (
            <Image
              src={`/${journal.cover_image}`}
              alt={journal.journal_name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          )}
        </div>
        <div className="flex-1 text-sm space-y-2">
          <p>
            <b>Editor in Chief:</b> Prof. [Fill from editorial_members table]
          </p>
          {journal.issn_online && (
            <p>
              <b>ISSN (Online):</b> {journal.issn_online}
            </p>
          )}
          {journal.issn_print && (
            <p>
              <b>ISSN (Print):</b> {journal.issn_print}
            </p>
          )}
          <p>
            <b>Subject:</b> {journal.subject}
          </p>
          <p>
            <b>Year of Starting:</b> {journal.year_started}
          </p>
          <p>
            <b>Publication Frequency:</b> {journal.publication_frequency}
          </p>
          <p>
            <b>Language:</b> {journal.language}
          </p>
          <p>
            <b>Paper Submission:</b> {journal.paper_submission_id}
          </p>
          <p>
            <b>Publisher:</b> {journal.publisher}
          </p>
          <p>
            <b>Publication Fee:</b> {journal.publication_fee}
          </p>
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
    </div>
  );
}
