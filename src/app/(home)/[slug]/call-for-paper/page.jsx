// import { getRenderedJournalPage } from "@/utils/journalPageDynamic";
// import { getJournalBySlug } from "@/utils/jounals";

// export default async function CallForPaperPage({ params }) {
//   const { slug } = params;
//   const journal = await getJournalBySlug(slug);
//   if (!journal) return <p>Journal not found</p>;

//   const data = await getRenderedJournalPage(journal.id, "call_for_paper");

//   const renderedContent =
//     typeof data?.rendered_content === "string"
//       ? data.rendered_content
//       : "<p>No Call for Paper content found.</p>";

//   return (
//     <div className="prose max-w-none">
//       <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
//     </div>
//   );
// }

// import { getRenderedJournalPage } from "@/utils/journalPageDynamic";
// import { getJournalBySlug } from "@/utils/jounals";

// export default async function CallForPaperPage({ params }) {
//   const { slug } = params;

//   // 1️⃣ Fetch journal
//   const journal = await getJournalBySlug(slug);
//   if (!journal) {
//     return (
//       <div className="p-6 text-center text-red-600">
//         Journal not found
//       </div>
//     );
//   }

//   // 2️⃣ Fetch rendered dynamic page
//   const data = await getRenderedJournalPage(journal.id, "call_for_paper");

//   // 3️⃣ Determine content
//   const renderedContent =
//     typeof data?.rendered_content === "string"
//       ? data.rendered_content
//       : "<p>No Call for Paper content found.</p>";

//   // 4️⃣ Return proper React JSX
//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8 prose">
//       <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
//     </div>
//   );
// }

import { getRenderedJournalPage } from "@/utils/journalPageDynamic";
import { getJournalBySlug } from "@/utils/journals";


export default async function CallForPaperPage({ params }) {
  const { slug } = await params;

  // 1️⃣ Fetch journal
  const journal = await getJournalBySlug(slug);
  if (!journal) {
    return (
      <div className="p-6 text-center text-red-600">
        Journal not found
      </div>
    );
  }

  // 2️⃣ Fetch rendered dynamic page
  const data = await getRenderedJournalPage(journal.id, "call_for_paper");

  // 3️⃣ Determine content
  const renderedContent =
    typeof data?.rendered_content === "string" && data.rendered_content.trim()
      ? data.rendered_content
      : "<p>No Call for Paper content found.</p>";

  // 4️⃣ Return proper React JSX
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose">
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
}

