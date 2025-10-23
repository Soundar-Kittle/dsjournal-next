import { getJournalBySlug } from "@/utils/jounals";
import { getJournalPageByTitle } from "@/utils/journalPage";

const page = async ({ params }) => {
  const { slug } = await params;
  const journal = await getJournalBySlug(slug);

  const content = await getJournalPageByTitle(journal?.id, "apc");

  if (!content || !content.content || content.is_active !== 1) {
    return (
      <div className="">
        <h1 className="text-2xl font-semibold mb-4">
          APC – {journal?.journal_name}
        </h1>
        <p className="text-gray-500">APC information will be updated soon.</p>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: content.content }} />;
};

export default page;
