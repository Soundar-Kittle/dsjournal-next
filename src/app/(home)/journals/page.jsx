// ISR: Rebuild every 60 seconds
export const revalidate = 60; // 1 hour;

import { generateDynamicMeta } from "@/lib/seo/generateDynamicMeta";
import PageHeader from "@/components/Home/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JournalCard from "@/components/Home/Journals/JournalCard";
import { getJournals } from "@/utils/journals";
import { Search } from "lucide-react";

// SEO Metadata
export async function generateMetadata() {
  return await generateDynamicMeta("journals");
}

export default async function JournalsPage({ searchParams }) {
  const params = await searchParams;
  const q = String(params?.q ?? "").trim();

  const journals = await getJournals(q);

  return (
    <main>
      <header>
        <PageHeader title="Journals" />
        <Breadcrumbs
          parents={[{ menu_label: "Journals", menu_link: "/journals" }]}
        />
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 py-10">
        {/* Search Form */}
        {/* <form
          className="mb-6 flex gap-3 max-sm:max-w-2xs max-sm:mx-auto"
          action="/journals"
          method="get"
        >
          <div className="relative w-full sm:w-xl overflow-hidden rounded-lg">
            <input
              type="text"
              name="q"
              placeholder="Search by journal name or ISSN…"
              defaultValue={q}
              autoComplete="off"
              className="w-full border rounded-lg border-slate-300 bg-white px-4 py-3 pr-10 text-xs shadow-sm 
                 focus:border-primary focus:ring-2 focus:ring-primary/30 sm:text-base"
              list="journals-suggestions"
            />
            <button type="submit">
              <Search className="bg-primary absolute w-14 h-full top-0 right-0 text-white cursor-pointer p-3" />
            </button>

            <datalist id="journals-suggestions">
              {journals.map((j) => (
                <option key={j.id} value={j.name} />
              ))}
            </datalist>
          </div>
        </form> */}

        {/* Journals List */}
        {journals.length === 0 ? (
          <p className="text-slate-600">No journals found.</p>
        ) : (
          <div className="grid gap-6 max-sm:max-w-2xs max-sm:mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {journals.map((j) => (
              <JournalCard key={j.id} j={j} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
