import { getJournalBySlug } from "@/utils/journals";
import { getJournalPageByTitle } from "@/utils/journalPage";

const page = async ({ params }) => {
  const { slug } = await params;
  const journal = await getJournalBySlug(slug);

  const content = await getJournalPageByTitle(journal?.id, "topics");

  if (!content || !content.content || content.is_active !== 1) {
    return (
      <div className="">
        <h1 className="text-2xl font-semibold mb-4">
          Topics – {journal?.journal_name}
        </h1>
        <p className="text-gray-500">
          Topics information will be updated soon.
        </p>
      </div>
    );
  }

  return (
    <div
      className="[&_ul]:list-disc [&_ol]:list-decimal"
      dangerouslySetInnerHTML={{ __html: content.content }}
    />
  );
};

export default page;
