import { getJournalBySlug } from "@/utils/journals";
import { getJournalPageByTitle } from "@/utils/journalPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModeofPage({ params }) {
  const { slug } = await params;            // 👈 await this
  const journal = await getJournalBySlug(slug);
  if (!journal) {
    return <div className="p-10 text-center text-gray-500">Journal Not Found</div>;
  }

  const pageData = await getJournalPageByTitle(journal.id, "mode_of_payment");
  const isActive = Number(pageData?.is_active) === 1; // coerce "1"/1
  const hasHtml = !!pageData?.content?.trim();

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-6">Mode of Payment</h2>

      {pageData?.content?.trim() ? (
        <div
          className="prose max-w-none mt-8"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      ) : (
        <p className="text-gray-500 mt-8 text-center">No Data Found</p>
      )}
    </div>
  );
}
